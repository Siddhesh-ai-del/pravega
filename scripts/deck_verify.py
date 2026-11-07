#!/usr/bin/env python3
"""deck_verify.py — Stage-1 verification gate for make-ppts decks.

Standalone, exit-code gated. Run AFTER build, BEFORE claiming done.
Stage 2 (render + visual inspect) is deck_render.sh — this script cannot
replace looking at every rendered slide.

Usage:
  python deck_verify.py --deck Output.pptx \
      [--template Template.pptx] [--design design.json] \
      [--whitelist numbers.json] [--expect-slides 7] [--expect-size 10x5.625] \
      [--allow-placeholder "Track Name"] [--exempt-prefix bg] [--strict]

numbers.json maps every numeric token in the deck to its source:
  {"97.5%": "metrics.json#/external/referable_dr_sensitivity",
   "8.3":   {"ref": "metrics.json#/latency/p95_ms", "value": 8.3}}
No source → remove the number from the deck. Never fabricate.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from pptx.oxml.ns import qn  # noqa: E402
from deck_lib import (  # noqa: E402
    contrast_ratio,
    estimate_shape_overflow,
    sha256_file,
    walk,
)

TOKEN_RE = re.compile(r"\d[\d,]*\.?\d*%?")
PLACEHOLDER_RE = re.compile(
    r"(\[\s*(enter|your|insert|type|add)\b|\{\{.*?\}\}|<your\b)", re.IGNORECASE
)
SAFE_FONTS = {"Calibri", "Georgia", "Times New Roman", "Arial", "Aptos"}
# python-pptx auto-names reset per slide; same default name = different shape.
# Consistency checks therefore only cover shapes the builder NAMED intentionally
# (skill convention: S<slide><Role>, e.g. "S2Heading").
DEFAULT_SHAPE_RE = re.compile(
    r"^(TextBox|Rounded Rectangle|Rectangle|Straight Connector|Connector|Oval|"
    r"Picture|Right Arrow|Left Arrow|Down Arrow|Up Arrow|Chart|Group|Freeform|"
    r"Isosceles Triangle|Donut|Pie|Chevron|Pentagon|Hexagon|Diamond|Parallelogram|"
    r"Trapezoid|Frame|Plaque|Can|Cylinder|Cube|Callout|Curved Connector|"
    r"Tab|Title|Content Placeholder|Date Placeholder|Footer Placeholder|"
    r"Straight Arrow Connector|Right Arrow Callout|Word|Table)\s+\d+$"
)
EMU_IN = 914400
GEOM_TOL = 0.02  # inches — shape-geometry match tolerance vs template
BOUNDS_TOL = 0.06  # inches — small template overhangs are exempt
CHROME_SHRINK = 0.03  # inches — allows intentional adjacency to chrome


class Report:
    def __init__(self):
        self.fails, self.warns, self.infos = [], [], []

    def fail(self, msg):
        self.fails.append(msg)

    def warn(self, msg):
        self.warns.append(msg)

    def info(self, msg):
        self.infos.append(msg)

    def print_and_exit(self, strict: bool):
        for m in self.infos:
            print(f"  INFO  {m}")
        for m in self.warns:
            print(f"  WARN  {m}")
        for m in self.fails:
            print(f"  FAIL  {m}")
        bad = len(self.fails) + (len(self.warns) if strict else 0)
        verdict = "PASS" if bad == 0 else f"FAIL ({bad} issue{'s' if bad > 1 else ''})"
        print(f"\nStage 1: {verdict}")
        raise SystemExit(0 if bad == 0 else 1)


def emu_in(v) -> float:
    return round(v / EMU_IN, 3)


def bbox_in(shape):
    if None in (shape.left, shape.top, shape.width, shape.height):
        return None
    return (
        emu_in(shape.left),
        emu_in(shape.top),
        emu_in(shape.left + shape.width),
        emu_in(shape.top + shape.height),
    )


def overlaps(a, b) -> float:
    """Intersection area of two (l, t, r, b) bboxes, in square inches."""
    dx = min(a[2], b[2]) - max(a[0], b[0])
    dy = min(a[3], b[3]) - max(a[1], b[1])
    return dx * dy if dx > 0 and dy > 0 else 0.0


def shrink(box, by=CHROME_SHRINK):
    return (box[0] + by, box[1] + by, box[2] - by, box[3] - by)


# ------------------------------------------------------------------ checks


def check_structure(prs, args, rep: Report):
    if args.expect_slides and len(prs.slides) != args.expect_slides:
        rep.fail(
            f"slide count {len(prs.slides)} != format's {args.expect_slides} "
            "(never add slides to a fixed format)"
        )
    if args.expect_size:
        w, h = (float(v) for v in args.expect_size.lower().split("x"))
        aw, ah = emu_in(prs.slide_width), emu_in(prs.slide_height)
        if abs(aw - w) > 0.01 or abs(ah - h) > 0.01:
            rep.fail(f"slide size {aw}x{ah} in != expected {w}x{h} in")


def check_template_sha(args, rep: Report):
    if not args.template:
        return
    original = Path(args.template).with_suffix(".template.sha256")
    if original.exists():
        expected = original.read_text().strip()
        actual = sha256_file(args.template)
        if actual != expected:
            rep.fail(f"template {args.template} was MODIFIED (sha256 drift)")
        else:
            rep.info("template sha256 unchanged")
    else:
        rep.warn(f"{original} not found — pin the template's sha256 before building")


def iter_runs(prs):
    for idx, slide in enumerate(prs.slides, 1):
        for shape in walk(slide.shapes):
            if shape.has_text_frame:
                for para in shape.text_frame.paragraphs:
                    for run in para.runs:
                        yield idx, shape, run


def check_content(prs, args, rep: Report):
    allowed = [p.lower() for p in args.allow_placeholder]
    for idx, slide in enumerate(prs.slides, 1):
        for shape in walk(slide.shapes):
            if not shape.has_text_frame:
                continue
            text = shape.text
            if PLACEHOLDER_RE.search(text) and not any(
                a in text.lower() for a in allowed
            ):
                rep.fail(
                    f"slide {idx}: leftover template prompt in '{shape.name}': "
                    f"{text[:60]!r}"
                )
    for idx, slide in enumerate(prs.slides, 1):
        for shape in walk(slide.shapes):
            box = bbox_in(shape)
            if not box:
                continue
            if (
                box[0] < -BOUNDS_TOL
                or box[1] < -BOUNDS_TOL
                or box[2] > emu_in(prs.slide_width) + BOUNDS_TOL
                or box[3] > emu_in(prs.slide_height) + BOUNDS_TOL
            ):
                rep.fail(f"slide {idx}: '{shape.name}' outside slide bounds {box}")


def _font_installed(name: str) -> bool:
    """fc-match always returns a best-guess; compare families to detect
    a missing font (renders would silently substitute)."""
    try:
        out = subprocess.run(
            ["fc-match", "-f", "%{family}", name],
            capture_output=True,
            text=True,
            timeout=5,
        )
        got = [f.strip().lower() for f in out.stdout.strip().split(",")]
        return name.strip().lower() in got
    except (OSError, subprocess.TimeoutExpired):
        return True  # can't check — don't cry wolf


def check_fonts(prs, template, rep: Report):
    allowed = set(SAFE_FONTS)
    if template:
        allowed |= {r.font.name for _, _, r in iter_runs(template) if r.font.name}
    if args_design_faces:
        allowed |= set(args_design_faces)
    used = {r.font.name for _, _, r in iter_runs(prs) if r.font.name}
    for font in sorted(used - allowed):
        rep.fail(
            f"font not in whitelist: {font!r} "
            "(LibreOffice metrics differ from PowerPoint for unlisted fonts)"
        )
    # styles may legitimately use non-Whitelist fonts (styles/*.json faces);
    # those must at least be INSTALLED here or every render is a substitution
    for font in sorted(used & allowed - set(SAFE_FONTS)):
        if not _font_installed(font):
            rep.warn(
                f"design font not installed on this system: {font!r} — "
                "renders substitute a different face; text-fit numbers drift"
            )


def check_textfit(prs, rep: Report):
    """Real font-metric fit check — catches overflow before the render round."""
    for idx, slide in enumerate(prs.slides, 1):
        for shape in walk(slide.shapes):
            over = estimate_shape_overflow(shape)
            if over > 0.02:
                rep.warn(
                    f"slide {idx}: '{shape.name}' likely overflows by "
                    f"~{over:.2f} in — shorten copy or resize before rendering"
                )


def check_chrome_overlap(prs, template, args, rep: Report):
    """Added shapes must not collide with template chrome (headings/footers/logos)."""
    if not template:
        return
    exempt = tuple(args.exempt_prefix)
    for i, (out_slide, tpl_slide) in enumerate(zip(prs.slides, template.slides), 1):
        tpl_boxes = [b for s in walk(tpl_slide.shapes) if (b := bbox_in(s))]
        chrome = [shrink(b) for b in tpl_boxes]
        for shape in walk(out_slide.shapes):
            box = bbox_in(shape)
            if not box or shape.name.startswith(exempt):
                continue
            if any(
                all(abs(box[j] - c[j]) < GEOM_TOL for j in range(4)) for c in tpl_boxes
            ):
                continue  # identical geometry to a template shape = chrome, skip
            area = (box[2] - box[0]) * (box[3] - box[1])
            for c in chrome:
                hit = overlaps(box, c)
                if area and hit / area > 0.10:
                    rep.fail(
                        f"slide {i}: added shape '{shape.name}' overlaps "
                        f"template chrome by {hit / area:.0%} — move it"
                    )
                    break


def check_picture_overlap(prs, rep: Report):
    """Picture-over-picture overlap is always a bug (charts stacking, images
    covering each other) — catches layout errors even without a template."""
    from pptx.enum.shapes import MSO_SHAPE_TYPE

    for idx, slide in enumerate(prs.slides, 1):
        pics = [
            s
            for s in walk(slide.shapes)
            if s.shape_type == MSO_SHAPE_TYPE.PICTURE and bbox_in(s)
        ]
        for i, a in enumerate(pics):
            for b in pics[i + 1 :]:
                hit = overlaps(bbox_in(a), bbox_in(b))
                area_a = (bbox_in(a)[2] - bbox_in(a)[0]) * (
                    bbox_in(a)[3] - bbox_in(a)[1]
                )
                area_b = (bbox_in(b)[2] - bbox_in(b)[0]) * (
                    bbox_in(b)[3] - bbox_in(b)[1]
                )
                if hit / min(area_a, area_b) > 0.05:
                    rep.fail(
                        f"slide {idx}: pictures '{a.name}' and '{b.name}' "
                        f"overlap by {hit / min(area_a, area_b):.0%} — "
                        "an image is covering another"
                    )


def check_consistency(prs, rep: Report):
    """Cross-slide consistency: same-named added shapes must sit at the same place."""
    seen: dict[str, list] = {}
    for idx, slide in enumerate(prs.slides, 1):
        for shape in walk(slide.shapes):
            if not shape.has_text_frame:
                continue
            if DEFAULT_SHAPE_RE.match(shape.name):
                continue  # auto-name; same name on 2 slides = unrelated shapes
            box = bbox_in(shape)
            if not box:
                continue
            pts = [
                r.font.size.pt
                for p in shape.text_frame.paragraphs
                for r in p.runs
                if r.font.size is not None
            ]
            seen.setdefault(shape.name, []).append(
                (idx, round(box[0] / 0.25), round(box[1] / 0.25), max(pts, default=0))
            )
    for name, entries in seen.items():
        if len({(e[1], e[2], e[3]) for e in entries}) > 1 and len(entries) > 1:
            rep.warn(
                f"'{name}' is inconsistent across slides "
                f"{[e[0] for e in entries]} (position or size drift)"
            )


def check_notes_and_props(prs, rep: Report):
    for idx, slide in enumerate(prs.slides, 1):
        if slide.has_notes_slide:
            notes = slide.notes_slide.notes_text_frame.text.strip()
            if len(notes) < 100:
                rep.warn(f"slide {idx}: speaker notes too thin ({len(notes)} chars)")
    cp = prs.core_properties
    if not cp.title:
        rep.fail("docProps title not set")
    if not cp.author:
        rep.fail("docProps author not set")


def check_hyperlinks(prs, rep: Report):
    """Every hlinkClick must resolve to a real, full-URL target."""
    for idx, slide in enumerate(prs.slides, 1):
        for shape in walk(slide.shapes):
            if not shape.has_text_frame:
                continue
            for para in shape.text_frame.paragraphs:
                for run in para.runs:
                    rPr = run._r.find(qn("a:rPr"))
                    hlink = rPr.find(qn("a:hlinkClick")) if rPr is not None else None
                    if hlink is None:
                        continue
                    rid = hlink.get(qn("r:id"))
                    try:
                        target = slide.part.rels[rid].target_ref
                    except KeyError:
                        rep.fail(
                            f"slide {idx}: hyperlink run {run.text[:30]!r} "
                            f"rId {rid} does not resolve"
                        )
                        continue
                    if not target.startswith(("http://", "https://", "mailto:")):
                        rep.warn(
                            f"slide {idx}: hyperlink {run.text[:30]!r} -> "
                            f"{target!r} is not a full URL"
                        )


def check_alt_text(prs, rep: Report):
    """Accessibility: pictures need real descr text, not the image filename."""
    from pptx.enum.shapes import MSO_SHAPE_TYPE

    for idx, slide in enumerate(prs.slides, 1):
        for shape in walk(slide.shapes):
            if shape.shape_type != MSO_SHAPE_TYPE.PICTURE:
                continue
            descr = (shape._element._nvXxPr.cNvPr.get("descr") or "").strip()
            looks_like_filename = " " not in descr and re.search(
                r"\.(png|jpe?g|gif|bmp|tiff?|webp|emf|wmf)$", descr, re.I
            )
            if not descr or looks_like_filename:
                rep.warn(
                    f"slide {idx}: picture '{shape.name}' has no real alt text "
                    "(set_alt_text) — accessibility checker will flag it"
                )


def check_contrast(prs, rep: Report):
    """WCAG contrast for runs whose color and background are both explicit."""
    from pptx.enum.dml import MSO_FILL

    for idx, slide in enumerate(prs.slides, 1):
        for shape in walk(slide.shapes):
            if not shape.has_text_frame:
                continue
            try:
                if shape.fill.type != MSO_FILL.SOLID:
                    continue
                bg = str(shape.fill.fore_color.rgb)
            except (AttributeError, TypeError):
                continue
            for para in shape.text_frame.paragraphs:
                for run in para.runs:
                    try:
                        fg = str(run.font.color.rgb)
                    except (AttributeError, TypeError):
                        continue
                    ratio = contrast_ratio(fg, bg)
                    if ratio < 3.0:
                        rep.warn(
                            f"slide {idx}: contrast {ratio:.1f}:1 for "
                            f"{run.text[:25]!r} ({fg} on {bg}) — WCAG AA wants 4.5:1"
                        )


def _token_value(token: str) -> tuple[float, float]:
    """Numeric value + rounding tolerance implied by the token's decimals."""
    bare = token.replace(",", "")
    pct = bare.endswith("%")
    num = float(bare.rstrip("%"))
    decimals = len(bare.split(".")[1]) if "." in bare else 0
    return num, max(0.5 * 10**-decimals, 0.001)


def check_numeric(prs, whitelist_path, rep: Report):
    """Every numeric token maps to a real source. No source → remove the number."""
    if not whitelist_path:
        rep.warn("no --whitelist given — numeric traceability NOT verified")
        return
    whitelist = json.loads(Path(whitelist_path).read_text())
    used, base = set(), Path(whitelist_path).parent
    for idx, slide in enumerate(prs.slides, 1):
        for shape in walk(slide.shapes):
            if not shape.has_text_frame:
                continue
            if shape.name.endswith("Folio"):
                continue  # page furniture ("01 / 08"), not a numeric claim
            for raw in TOKEN_RE.findall(shape.text):
                token = raw.rstrip(".") or raw  # sentence period: "90." -> "90"
                if token in used:
                    continue
                used.add(token)
                if token not in whitelist:
                    rep.fail(
                        f"slide {idx}: number {token!r} has no source — add it "
                        f"to {whitelist_path} or remove it from the deck"
                    )
                    continue
                entry = whitelist[token]
                ref = entry if isinstance(entry, str) else entry["ref"]
                path_part = ref.split("#", 1)[0]
                if not (base / path_part).exists():
                    rep.fail(
                        f"number {token!r}: cited source {path_part!r} does not exist"
                    )
                elif isinstance(entry, dict) and "value" in entry:
                    val, tol = _token_value(token)
                    if abs(val - float(entry["value"])) > max(
                        tol, abs(entry["value"]) * 0.005
                    ):
                        rep.fail(
                            f"number {token!r} != source value {entry['value']} "
                            "(cross-check failed)"
                        )
    for token in whitelist:
        if token not in used:
            rep.info(f"whitelist entry {token!r} unused (deck no longer contains it)")


args_design_faces: set = set()


# ------------------------------------------------------------------ main


def main():
    global args_design_faces
    ap = argparse.ArgumentParser()
    ap.add_argument("--deck", required=True)
    ap.add_argument("--template")
    ap.add_argument("--design", default="design.json")
    ap.add_argument("--whitelist")
    ap.add_argument("--expect-slides", type=int)
    ap.add_argument("--expect-size", help="e.g. 10x5.625")
    ap.add_argument("--allow-placeholder", action="append", default=[])
    ap.add_argument("--exempt-prefix", action="append", default=["bg"])
    ap.add_argument("--strict", action="store_true", help="warnings also fail")
    args = ap.parse_args()

    from pptx import Presentation

    prs = Presentation(args.deck)
    template = Presentation(args.template) if args.template else None
    if Path(args.design).exists():
        args_design_faces = set(
            json.loads(Path(args.design).read_text())["faces"].values()
        )

    rep = Report()
    check_structure(prs, args, rep)
    check_template_sha(args, rep)
    check_content(prs, args, rep)
    check_fonts(prs, template, rep)
    check_textfit(prs, rep)
    check_chrome_overlap(prs, template, args, rep)
    check_picture_overlap(prs, rep)
    check_consistency(prs, rep)
    check_notes_and_props(prs, rep)
    check_hyperlinks(prs, rep)
    check_alt_text(prs, rep)
    check_contrast(prs, rep)
    check_numeric(prs, args.whitelist, rep)
    rep.print_and_exit(args.strict)


if __name__ == "__main__":
    main()
