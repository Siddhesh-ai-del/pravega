"""deck_lib.py — shared helpers for make-ppts deck builds.

Copy into your project (e.g. scripts/deck_lib.py) so the deck stays a
reproducible build artifact. Companion: deck_verify.py (Stage-1 gate),
deck_render.sh (Stage-2 render loop), design.example.json (design system).
"""

from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageFont
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE, MSO_SHAPE_TYPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.oxml.ns import qn
from pptx.util import Inches, Pt

PX_PER_IN = 72  # work at 72 dpi so px == pt in measurements
DEFAULT_LINE_SPACING = 1.2
TEXT_INSET_H = 0.10  # pptx default left/right text inset (inches)
TEXT_INSET_V = 0.05  # pptx default top/bottom text inset
_FONT_CACHE: dict[str, str | None] = {}


# ---------------------------------------------------------------- environment


def preflight() -> list[str]:
    """Return a list of missing dependencies (empty list = ready to build)."""
    problems = []
    for mod, pkg in (
        ("pptx", "python-pptx"),
        ("PIL", "pillow"),
        ("matplotlib", "matplotlib"),
    ):
        try:
            __import__(mod)
        except ImportError:
            problems.append(f"python package missing: {pkg}  (pip install {pkg})")
    for cmd, hint in (
        ("soffice", "apt install libreoffice-impress"),
        ("pdftoppm", "apt install poppler-utils"),
        ("fc-match", "apt install fontconfig"),
    ):
        if shutil.which(cmd) is None:
            problems.append(f"binary missing: {cmd}  ({hint})")
    return problems


def require_env() -> None:
    problems = preflight()
    if problems:
        print("Preflight failed:", file=sys.stderr)
        for p in problems:
            print(f"  - {p}", file=sys.stderr)
        raise SystemExit(1)


# ---------------------------------------------------------------- design system


def load_design(path: str = "design.json") -> dict:
    """Load the shared design system consumed by BOTH builder and verifier."""
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(
            f"design system file missing: {path} — copy design.example.json and edit"
        )
    return json.loads(p.read_text())


def hex_rgb(value: str) -> RGBColor:
    return RGBColor.from_string(value.lstrip("#"))


def contrast_ratio(hex_a: str, hex_b: str) -> float:
    """WCAG 2.2 contrast ratio between two hex colors."""

    def luminance(h: str) -> float:
        v = h.lstrip("#")
        channels = [int(v[i : i + 2], 16) / 255 for i in (0, 2, 4)]
        linear = [
            c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
            for c in channels
        ]
        return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]

    la, lb = luminance(hex_a), luminance(hex_b)
    light, dark = max(la, lb), min(la, lb)
    return (light + 0.05) / (dark + 0.05)


# ---------------------------------------------------------------- shapes


def walk(shapes):
    """Recurse into groups, yielding every shape."""
    for s in shapes:
        yield s
        if s.shape_type == MSO_SHAPE_TYPE.GROUP:
            yield from walk(s.shapes)


def find_shape(slide, name: str):
    """Identify shapes by NAME, not index — template indices shift."""
    return next((s for s in walk(slide.shapes) if s.name == name), None)


def set_text(shape, lines) -> None:
    """Replace text, preserving each paragraph's first-run formatting.

    NEVER use shape.text = "..." — it destroys run-level rPr (font/size/color)
    and paragraph properties (bullets/numbering).
    """
    if isinstance(lines, str):
        lines = [lines]
    paras = shape.text_frame.paragraphs
    for i, line in enumerate(lines):
        if i < len(paras) and paras[i].runs:
            runs = paras[i].runs
            runs[0].text = line  # keep run 0's rPr
            for r in runs[1:]:
                r.text = ""  # blank the rest, don't delete
        elif i < len(paras):
            paras[i].text = line  # empty paragraph: safe, inherits pPr
        else:
            shape.text_frame.add_paragraph().text = line
    for p in list(paras[len(lines) :]):  # drop leftover paragraphs
        p._p.getparent().remove(p._p)


def set_alt_text(shape, description: str) -> None:
    """Accessibility: every picture/visual shape needs a descr for screen readers."""
    try:
        shape._element._nvXxPr.cNvPr.set("descr", description)
    except AttributeError:  # fallback: first p:cNvPr descendant
        for el in shape._element.iter(qn("p:cNvPr")):
            el.set("descr", description)
            break


def card(slide, x, y, w, h, fill="#F1F5F9", line="#D0D0D0", radius=0.06):
    s = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h)
    )
    s.fill.solid()
    s.fill.fore_color.rgb = hex_rgb(fill)
    s.line.color.rgb = hex_rgb(line)
    s.line.width = Pt(0.75)  # hairline
    s.shadow.inherit = False  # kill default shadow
    s.adjustments[0] = radius
    return s


def kpi(
    slide, x, y, w, value, label, design, num_size=None, label_size=None, color=None
):
    num_pt = num_size or design["scale_pt"]["kpi_value"]
    cap_pt = label_size or design["scale_pt"]["kpi_label"]
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(0.7))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    r = p.add_run()
    r.text = value
    r.font.name = design["faces"]["display"]
    r.font.size = Pt(num_pt)
    r.font.bold = True
    r.font.color.rgb = hex_rgb(color or design["palette"]["ink"])
    p2 = tf.add_paragraph()
    r2 = p2.add_run()
    r2.text = label
    r2.font.name = design["faces"]["body"]
    r2.font.size = Pt(cap_pt)
    r2.font.color.rgb = hex_rgb(design["palette"]["slate"])
    set_alt_text(tb, f"{value} — {label}")
    return tb


def chip(slide, x, y, w, text, design, size=None):
    pal = design["palette"]
    s = card(
        slide,
        x,
        y,
        w,
        0.28,
        fill=pal.get("mist", pal["paper"]),  # styles without mist use paper
        line=pal["line"],
    )
    tf = s.text_frame
    tf.word_wrap = False
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = text
    r.font.name = design["faces"]["body"]
    r.font.size = Pt(size or design["scale_pt"]["caption"])
    r.font.color.rgb = hex_rgb(design["palette"]["slate"])
    return s


def rule(slide, x, y, w, design, color=None):
    """Hairline horizontal rule."""
    from pptx.enum.shapes import MSO_CONNECTOR

    c = slide.shapes.add_connector(
        MSO_CONNECTOR.STRAIGHT, Inches(x), Inches(y), Inches(x + w), Inches(y)
    )
    c.line.color.rgb = hex_rgb(color or design["palette"]["line"])
    c.line.width = Pt(style_of(design)["rules_pt"])  # style sets hairline weight
    return c


def arrow(slide, x, y, w, h, design):
    """Use plain typographic glyphs (► U+25BA) in text instead when possible —
    ▶ renders as orange color-emoji in LibreOffice."""
    s = slide.shapes.add_shape(
        MSO_SHAPE.RIGHT_ARROW, Inches(x), Inches(y), Inches(w), Inches(h)
    )
    s.fill.solid()
    s.fill.fore_color.rgb = hex_rgb(design["palette"]["accent"])
    s.line.fill.background()
    s.shadow.inherit = False
    return s


# ---------------------------------------------------------------- pictures


def crop_to_aspect(image_path, target_ratio: float, tmpdir=".deck_assets/cropped"):
    """Center-crop an image to target_ratio (w/h) so placement never distorts it."""
    img = Image.open(image_path)
    w, h = img.size
    if abs(w / h - target_ratio) < 0.01:
        return str(image_path)
    if w / h > target_ratio:  # too wide → trim sides
        new_w = int(h * target_ratio)
        box = ((w - new_w) // 2, 0, (w + new_w) // 2, h)
    else:  # too tall → trim top/bottom
        new_h = int(w / target_ratio)
        box = (0, (h - new_h) // 2, w, (h + new_h) // 2)
    out = Path(tmpdir)
    out.mkdir(parents=True, exist_ok=True)
    dst = out / f"{Path(image_path).stem}_{target_ratio:.3f}.png"
    img.crop(box).save(dst)
    return str(dst)


def place_picture(slide, image_path, x, y, w, h, alt=None):
    """Fill an exact w×h box WITHOUT distortion (crop-to-aspect via PIL).

    Passing both width and height to add_picture directly STRETCHES the image.
    Give only w or only h to preserve aspect and fit by that dimension.
    """
    cropped = crop_to_aspect(image_path, w / h)
    pic = slide.shapes.add_picture(cropped, Inches(x), Inches(y), Inches(w), Inches(h))
    if alt:
        set_alt_text(pic, alt)
    return pic


# ---------------------------------------------------------------- text metrics


def resolve_font_file(font_name: str, bold: bool = False) -> str | None:
    """Map a font NAME to a font FILE via fc-match (cached)."""
    key = f"{font_name}:bold={bold}"
    if key in _FONT_CACHE:
        return _FONT_CACHE[key]
    path = None
    try:
        q = f"{font_name}:bold" if bold else font_name
        out = subprocess.run(
            ["fc-match", "-f", "%{file}", q], capture_output=True, text=True, timeout=5
        )
        if out.returncode == 0 and out.stdout.strip().endswith((".ttf", ".otf")):
            path = out.stdout.strip()
    except (OSError, subprocess.TimeoutExpired):
        pass
    _FONT_CACHE[key] = path
    return path


def wrap_text(
    text: str, font_path: str | None, pt_size: float, max_width_in: float
) -> list[str]:
    """Greedy word-wrap simulation at 72 dpi (px == pt)."""
    max_w_px = max(max_width_in * PX_PER_IN, 1)
    if font_path:
        font = ImageFont.truetype(font_path, max(int(round(pt_size)), 1))
    words, lines, cur = text.split(), [], ""
    for w in words:
        trial = f"{cur} {w}".strip()
        width = (
            font.getlength(trial) if font_path else len(trial) * pt_size * 0.5
        )  # conservative fallback
        if width <= max_w_px or not cur:
            cur = trial
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines or [""]


def text_height_in(
    text: str,
    font_name: str,
    pt_size: float,
    max_width_in: float,
    line_spacing: float = DEFAULT_LINE_SPACING,
    bold: bool = False,
) -> float:
    font_path = resolve_font_file(font_name, bold)
    n = len(wrap_text(text, font_path, pt_size, max_width_in))
    return n * pt_size * line_spacing / PX_PER_IN


def estimate_shape_overflow(shape) -> float:
    """Estimated (needed_height − available_height) in inches; >0 means clipped."""
    if not shape.has_text_frame or not shape.text.strip():
        return 0.0
    w_in = shape.width / 914400 - 2 * TEXT_INSET_H
    h_in = shape.height / 914400 - 2 * TEXT_INSET_V
    needed = 0.0
    for para in shape.text_frame.paragraphs:
        sizes = [r.font.size.pt for r in para.runs if r.font.size is not None]
        pt = max(sizes) if sizes else 18.0
        names = [r.font.name for r in para.runs if r.font.name]
        name = names[0] if names else "Calibri"
        bold = any(r.font.bold for r in para.runs)
        indent = 0.25 * para.level  # bullets indent → less width
        needed += text_height_in(para.text, name, pt, w_in - indent, bold=bold)
    return needed - h_in


# ---------------------------------------------------------------- data & files


def sha256_file(path) -> str:
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def metric_or_fail(metrics: dict, dotted: str, expected: float | None = None):
    """Assert a metric at build time — 'round into existence' is forbidden."""
    node = metrics
    for part in dotted.split("."):
        node = node[part]
    if expected is not None and abs(float(node) - float(expected)) > 1e-9:
        raise ValueError(f"metric drift: {dotted} = {node}, expected {expected}")
    return node


def atomic_save(prs, dst: str) -> None:
    """Write to a temp file, then atomically replace (deck may be open)."""
    tmp = dst + ".tmp"
    prs.save(tmp)
    lock = Path(".~lock." + Path(dst).name + "#")
    if lock.exists():
        print(f"WARNING: {dst} is open in LibreOffice — user must close/reopen")
    Path(tmp).replace(dst)


# ---------------------------------------------------------------- theme XML


def retint_links(prs, color: str = "475569") -> None:
    """LibreOffice ignores run color on hyperlink runs and paints theme blue.
    Retint a:hlink/a:folHlink in the OUTPUT deck's theme (never the template's)."""
    from lxml import etree

    for part in prs.part.package.iter_parts():
        if str(part.partname).startswith("/ppt/theme/"):
            # theme parts are generic Parts — no _element; parse/serialize the blob
            root = etree.fromstring(part.blob)
            for tag in ("a:hlink", "a:folHlink"):
                for el in root.iter(qn(tag)):
                    for child in list(el):
                        el.remove(child)
                    el.append(
                        el.makeelement(qn("a:srgbClr"), {"val": color.lstrip("#")})
                    )
            part._blob = etree.tostring(
                root, xml_declaration=True, encoding="UTF-8", standalone=True
            )


# ---------------------------------------------------------------- style system
# Design styles live in styles/*.json (see references/style-directions.md).
# Every style provides the base design.json contract (palette/faces/scale_pt/
# margins_in/line_spacing) plus an optional "style" block of signature tokens:
#   border_pt, shadow ("none"|"hard"), shadow_offset_in, radius_in,
#   rules_pt, folio ("none"|"corner"), grid_cols, plus per-style flags.

STYLE_DEFAULTS = {
    "border_pt": 0.75,
    "shadow": "none",
    "shadow_offset_in": 0.0,
    "radius_in": 0.06,
    "rules_pt": 0.75,
    "folio": "none",
}


def style_of(design: dict) -> dict:
    """Style tokens = STYLE_DEFAULTS overlaid with design["style"]."""
    return {**STYLE_DEFAULTS, **design.get("style", {})}


def pal(design: dict, key: str, fallback: str | None = None) -> str:
    """Palette lookup with fallback chain — styles may omit optional keys."""
    p = design["palette"]
    if key in p:
        return p[key]
    if fallback and fallback in p:
        return p[fallback]
    if fallback:
        raise KeyError(f"palette has neither {key!r} nor fallback {fallback!r}")
    raise KeyError(f"palette missing required key {key!r}")


def new_styled_slide(prs, design):
    """Blank slide with the style's backdrop applied (dark styles get a
    full-bleed paper rect at the back — add first so z-order works)."""
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    if design.get("mode") == "dark":
        s = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height
        )
        s.fill.solid()
        s.fill.fore_color.rgb = hex_rgb(pal(design, "paper"))
        s.line.fill.background()
        s.shadow.inherit = False
        s.name = "SBackdrop"
    return slide


def style_card(
    slide, x, y, w, h, design, fill=None, line=None, name=None, border_pt=None
):
    """Style-aware card: token border weight, square/rounded per radius,
    hard offset shadow when style.shadow == 'hard' (neo-brutalism sticker)."""
    st = style_of(design)
    fill = fill or pal(design, "mist", "paper")
    line_color = line or pal(design, "line")

    if st["shadow"] == "hard":  # solid offset block, no blur — the signature
        off = st["shadow_offset_in"]
        sh = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, Inches(x + off), Inches(y + off), Inches(w), Inches(h)
        )
        sh.fill.solid()
        sh.fill.fore_color.rgb = hex_rgb(st.get("shadow_color", "000000"))
        sh.line.fill.background()
        sh.shadow.inherit = False

    if st["radius_in"] <= 0:
        s = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h)
        )
    else:
        s = slide.shapes.add_shape(
            MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h)
        )
        s.adjustments[0] = min(st["radius_in"] / max(min(w, h), 0.01), 0.25)
    s.fill.solid()
    s.fill.fore_color.rgb = hex_rgb(fill)
    if border_pt is None:
        border_pt = st["border_pt"]
    if border_pt and border_pt > 0:
        s.line.color.rgb = hex_rgb(line_color)
        s.line.width = Pt(border_pt)
    else:
        s.line.fill.background()
    s.shadow.inherit = False
    if name:
        s.name = name
    return s


def display_text(
    slide,
    x,
    y,
    w,
    h,
    text,
    design,
    size=None,
    color=None,
    face=None,
    name=None,
    bold=True,
    spacing=None,
    align=PP_ALIGN.LEFT,
    anchor=None,
):
    """Oversized display type — the primary visual element of brutalist,
    swiss and minimal styles."""
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame
    tf.word_wrap = True
    if anchor:
        tf.vertical_anchor = anchor
    p = tf.paragraphs[0]
    p.alignment = align
    if spacing:
        p.line_spacing = spacing
    r = p.add_run()
    r.text = text
    r.font.name = face or design["faces"].get("display", design["faces"]["body"])
    r.font.size = Pt(size or design["scale_pt"].get("display", 60))
    r.font.bold = bold
    r.font.color.rgb = hex_rgb(color or pal(design, "ink"))
    if name:
        tb.name = name
    return tb


def tag(slide, x, y, text, design, fill=None, mono=True, name=None):
    """Neo-brutalist sticker tag: black-bordered chip with mono label,
    hard shadow, width auto-fitted to text."""
    st = style_of(design)
    face = (
        design["faces"].get("mono", design["faces"]["body"])
        if mono
        else design["faces"]["body"]
    )
    size = design["scale_pt"]["caption"]
    txt = text.upper()
    w = len(txt) * size * 0.011 + 0.36  # mono chars ~0.6em wide at 72dpi + pad
    if st["shadow"] == "hard":
        off = st["shadow_offset_in"]
        sh = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE,
            Inches(x + off),
            Inches(y + off),
            Inches(w),
            Inches(0.3),
        )
        sh.fill.solid()
        sh.fill.fore_color.rgb = hex_rgb(st.get("shadow_color", "000000"))
        sh.line.fill.background()
        sh.shadow.inherit = False
    s = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(0.3)
    )
    s.fill.solid()
    s.fill.fore_color.rgb = hex_rgb(fill or pal(design, "mist", "paper"))
    s.line.color.rgb = hex_rgb(pal(design, "line"))
    s.line.width = Pt(st["border_pt"])
    s.shadow.inherit = False
    tf = s.text_frame
    tf.word_wrap = False
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    tf.margin_left = tf.margin_right = Inches(0.08)
    tf.margin_top = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = txt
    r.font.name = face
    r.font.size = Pt(size)
    r.font.bold = True
    r.font.color.rgb = hex_rgb(pal(design, "ink"))
    if name:
        s.name = name
    return s


def folio(slide, n, design, total=None, x=12.55, y=7.05):
    """Corner folio number — editorial/swiss signature; styles opt in via
    style.folio = 'corner'."""
    if style_of(design)["folio"] != "corner":
        return None
    txt = f"{n:02d}" + (f" / {total:02d}" if total else "")
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(0.7), Inches(0.28))
    r = tb.text_frame.paragraphs[0].add_run()
    r.text = txt
    r.font.name = design["faces"].get("mono", design["faces"]["body"])
    r.font.size = Pt(design["scale_pt"]["caption"])
    r.font.color.rgb = hex_rgb(pal(design, "slate"))
    tb.name = f"S{n}Folio"
    return tb


def pull_quote(slide, x, y, w, text, design, size=None, name=None):
    """Editorial pull quote: oversized serif hung beside a spot-color bar."""
    size = size or int(design["scale_pt"]["display"] * 0.55)
    face = design["faces"]["display"]
    h = text_height_in(text, face, size, w - 0.25, design.get("line_spacing", 1.2))
    bar = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, Inches(x), Inches(y), Inches(0.06), Inches(h)
    )
    bar.fill.solid()
    bar.fill.fore_color.rgb = hex_rgb(pal(design, "accent"))
    bar.line.fill.background()
    bar.shadow.inherit = False
    tb = slide.shapes.add_textbox(
        Inches(x + 0.22), Inches(y - 0.05), Inches(w - 0.25), Inches(h + 0.3)
    )
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.line_spacing = design.get("line_spacing", 1.2)
    r = p.add_run()
    r.text = text
    r.font.name = face
    r.font.size = Pt(size)
    r.font.bold = True
    r.font.color.rgb = hex_rgb(pal(design, "ink"))
    if name:
        tb.name = name
    return tb


def terminal_panel(slide, x, y, w, h, title, design, fill=None, name=None):
    """Dark-technical terminal window: bordered panel + mono title bar strip."""
    body = style_card(
        slide,
        x,
        y,
        w,
        h,
        design,
        fill=fill or pal(design, "panel", "paper"),
        line=pal(design, "panel_line", "line"),
        name=name,
    )
    bar = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(0.32)
    )
    bar.fill.solid()
    bar.fill.fore_color.rgb = hex_rgb(pal(design, "panel_line", "line"))
    bar.line.fill.background()
    bar.shadow.inherit = False
    tf = bar.text_frame
    tf.word_wrap = False
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    tf.margin_left = Inches(0.12)
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.LEFT
    r = p.add_run()
    r.text = f"▌ {title.upper()}"
    r.font.name = design["faces"].get("mono", design["faces"]["body"])
    r.font.size = Pt(design["scale_pt"]["caption"])
    r.font.bold = True
    r.font.color.rgb = hex_rgb(pal(design, "accent"))
    return body


def marquee(slide, y, text, design, reps=5, fill=None, name=None, w_in=13.333):
    """Neo-brutalist ticker band: full-width color strip, repeated mono text."""
    band = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE,
        0,
        Inches(y),
        Inches(w_in),
        Inches(0.36),
    )
    band.fill.solid()
    band.fill.fore_color.rgb = hex_rgb(fill or pal(design, "accent"))
    band.line.fill.background()
    band.shadow.inherit = False
    tf = band.text_frame
    tf.word_wrap = False
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = "      ".join(text for _ in range(reps))
    r.font.name = design["faces"].get("mono", design["faces"]["body"])
    r.font.size = Pt(design["scale_pt"]["caption"])
    r.font.bold = True
    r.font.color.rgb = hex_rgb(pal(design, "ink"))
    if name:
        band.name = name
    return band
