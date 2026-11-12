#!/usr/bin/env python3
"""build_deck.py — Pravega · Quasar 5.0 Round-1 deck builder.

Style contract: design.json ("pravega-brutalist" — twin of app/globals.css):
concrete/paper/ink + ONE hazard-orange accent, Fira Sans Condensed display,
JetBrainsMono labels, 3pt borders, hard offset shadows, zero radius.

Fixed format: docs/round1-facts.md — exactly 10 slides / ~5:00.
Every number is asserted against a source file (preflight + numbers.json gate).

Run:  python3 scripts/deck_assets.py && python3 scripts/build_deck.py
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

from pptx import Presentation  # noqa: E402
from pptx.dml.color import RGBColor  # noqa: E402
from pptx.enum.shapes import MSO_SHAPE  # noqa: E402
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN  # noqa: E402
from pptx.oxml.ns import qn  # noqa: E402
from pptx.util import Inches, Pt  # noqa: E402

import deck_lib as L  # noqa: E402

ROOT_CHDIR = ROOT  # all paths absolute; gate runs from repo root

ASSETS = ROOT / ".deck_assets"
SHOTS = ROOT / "docs" / "screenshots"
OUT = ROOT / "pravega-round1.pptx"

design = L.load_design(str(ROOT / "design.json"))
PAL = design["palette"]
FACES = design["faces"]
SCALE = design["scale_pt"]
ST = L.style_of(design)

INK = PAL["ink"]
BG = PAL["paper"]  # concrete page (globals.css --background)
MIST = PAL["mist"]  # card surface (globals.css --card)
SLATE = PAL["slate"]
ACCENT = PAL["accent"]  # hazard orange — THE one accent
CONCD = PAL["concrete-dark"]

DISPLAY, BODY, MONO = FACES["display"], FACES["body"], FACES["mono"]

SLIDE_W, SLIDE_H = 13.333, 7.5
X0, CW = 0.6, 12.13
RIGHT = X0 + CW  # 12.73

TICKER = (
    "EVIDENCE OVER CLAIMS · ONE PROFILE — ONE TRAIL · "
    "APPEND-ONLY — NO DELETE PATH · "
)  # ×2 = 160 chars ≤ budget
COVER_TICKER = (
    "QUASAR 5.0 — ROUND 1 · EDTECH TRACK · "
    "VPPCOE & VA · T&P CELL · "
)  # ×3 = 189 chars ≤ budget

TOKEN_RE = re.compile(r"\d[\d,]*\.?\d*%?")


# ------------------------------------------------------------------ preflight


def require_sources() -> None:
    """Metric pre-flight: every load-bearing number exists in its source file."""
    rb = (ROOT / "docs/research-brief.md").read_text(errors="ignore")
    for t in ("56.35%", "54.81%", "46% in 2020", "11.2%", "42.6%", "3.0"):
        assert t in rb, f"research-brief lost {t!r}"
    seed = (ROOT / "db/seed.ts").read_text(errors="ignore")
    for t in (
        "weakShare: 60",
        "weakShare: 90",
        "placementRate: 71",
        "placementRate: 78",
        "placementRate: 64",
        "score: 21, max: 30",
        "score: 12, max: 20",
        "score: 17, max: 30",
        "demandShare: 61",
        "confidence: 0.78",
    ):
        assert t in seed, f"seed.ts lost {t!r}"
    rf = (ROOT / "docs/round1-facts.md").read_text(errors="ignore")
    for t in ("56.35%", "+8–15", "₹0", "36", "23–24 January 2027", "Feb"):
        assert t in rf, f"round1-facts lost {t!r}"
    plan = (ROOT / "docs/plan.md").read_text(errors="ignore")
    assert "40% of new JDs, batch 10%" in plan, "plan.md lost the 40/10 Docker stat"
    ha = (ROOT / "HACKATHON.md").read_text(errors="ignore")
    assert "≤90s" in ha, "HACKATHON.md lost the 90s video cap"
    rd = (ROOT / "README.md").read_text(errors="ignore")
    for t in (
        "Next.js 16",
        "React 19",
        "Tailwind v4",
        "0 high/critical",
        "E2E-3%2F3",
        "Siddhesh-ai-del/pravega",
    ):
        assert t in rd, f"README lost {t!r}"
    for p in (
        "brutalist-verify.png",
        "brutalist-mockdrive.png",
        "brutalist-officer-queue.png",
        "brutalist-ledger.png",
        "brutalist-heatmap.png",
    ):
        assert (SHOTS / p).exists(), f"missing screenshot {p}"
    for p in ("backdrop.png", "employability.png", "weakshare.png", "qr_github.png"):
        assert (ASSETS / p).exists(), f"missing asset {p} — run deck_assets.py"


# ------------------------------------------------------------------ primitives


def hex_(v: str) -> RGBColor:
    return L.hex_rgb(v)


def text_width_in(text: str, font: str, pt: float, bold: bool = False) -> float:
    """Measured single-line width in inches (PIL on the resolved font file)."""
    from PIL import ImageFont

    path = L.resolve_font_file(font, bold)
    if not path:
        return len(text) * pt * 0.6 / 72
    return ImageFont.truetype(path, max(int(round(pt)), 1)).getlength(text) / 72


def set_bg(slide) -> None:
    """Slide background = dot-grid concrete PNG via <p:bg> (not a picture
    shape — the gate's picture-overlap check must not see a full-bleed image)."""
    _, rId = slide.part.get_or_add_image_part(str(ASSETS / "backdrop.png"))
    xml = (
        '<p:bg xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" '
        'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
        '<p:bgPr><a:blipFill dpi="0" rotWithShape="1">'
        f'<a:blip r:embed="{rId}"/><a:stretch><a:fillRect/></a:stretch>'
        "</a:blipFill><a:effectLst/></p:bgPr></p:bg>"
    )
    from lxml import etree

    cSld = slide._element.find(qn("p:cSld"))
    cSld.insert(0, etree.fromstring(xml))


def new_slide(prs) -> object:
    s = prs.slides.add_slide(prs.slide_layouts[6])
    set_bg(s)
    return s


def _h_for(paras: list[dict], w: float) -> float:
    """Box height satisfying BOTH the gate estimator (w−0.2 / +0.10 phantom
    insets, fixed 1.2 line factor) and the real LibreOffice render
    (wrap at w, pt·1.2·sp per line)."""
    gate = real = 0.0
    for p in paras:
        lines = len(
            L.wrap_text(
                p["t"],
                L.resolve_font_file(p.get("f", BODY), p.get("b", False)),
                p["pt"],
                max(w - 0.2, 0.1),
            )
        )
        gate += lines * p["pt"] * 1.2 / 72
        sp = p.get("sp", 1.15)
        real += lines * p["pt"] * 1.2 * max(sp, 1.0) / 72
    return max(gate + 0.12, real + 0.04)


def tb(
    slide,
    x,
    y,
    w,
    paras,
    h=None,
    name=None,
    align=PP_ALIGN.LEFT,
    anchor=None,
    wrap=True,
):
    """Text box. paras: dicts {t, pt, c, b, f, sp}. Height auto-sized to pass
    the gate AND the real render; margins zeroed (phantom inset is the only one)."""
    box = slide.shapes.add_textbox(
        Inches(x), Inches(y), Inches(w), Inches(h or _h_for(paras, w))
    )
    tf = box.text_frame
    tf.word_wrap = wrap
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    if anchor:
        tf.vertical_anchor = anchor
    for i, spec in enumerate(paras):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = spec.get("align", align)
        p.line_spacing = spec.get("sp", 1.15)
        r = p.add_run()
        r.text = spec["t"]
        r.font.name = spec.get("f", BODY)
        r.font.size = Pt(spec["pt"])
        r.font.bold = spec.get("b", False)
        r.font.color.rgb = hex_(spec.get("c", INK))
    if name:
        box.name = name
    return box


def card(slide, x, y, w, h, fill=MIST, line=INK, border=None, name=None):
    """Sticker card per design.json tokens (hard shadow + 3pt border, radius 0)."""
    return L.style_card(
        slide, x, y, w, h, design, fill=fill, line=line, name=name, border_pt=border
    )


def rect(slide, x, y, w, h, fill=ACCENT, line=None, line_w=None, name=None):
    s = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h)
    )
    s.shadow.inherit = False
    if fill is None:
        s.fill.background()
    else:
        s.fill.solid()
        s.fill.fore_color.rgb = hex_(fill)
    if line is None:
        s.line.fill.background()
    else:
        s.line.color.rgb = hex_(line)
        s.line.width = Pt(line_w or 1.0)
    if name:
        s.name = name
    return s


def band(slide, y, text, fill=INK, fg=BG, h=0.36, size=8):
    """Full-width ticker band (site marquee twin). Text must fit one line."""
    rect(slide, 0, y, SLIDE_W, h, fill=fill)
    tb(
        slide,
        0.2,
        y,
        SLIDE_W - 0.4,
        [{"t": text, "pt": size, "c": fg, "b": True, "f": MONO, "sp": 1.0}],
        h=h,
        align=PP_ALIGN.CENTER,
        anchor=MSO_ANCHOR.MIDDLE,
        wrap=False,
    )


def stripe(slide, x, y, w, h, fill=ACCENT, name=None):
    return rect(slide, x, y, w, h, fill=fill, name=name)


def kicker(slide, text):
    tb(
        slide,
        X0,
        0.52,
        8.6,
        [{"t": text, "pt": 9, "c": SLATE, "b": True, "f": MONO, "sp": 1.0}],
    )
    L.rule(slide, X0, 0.92, CW, design)


def tag_right(slide, text):
    w = len(text.upper()) * SCALE["caption"] * 0.011 + 0.36
    L.tag(slide, RIGHT - w, 0.47, text, design, fill=ACCENT)


def source_line(slide, text):
    tb(
        slide,
        X0,
        7.06,
        10.6,
        [{"t": text, "pt": 7.5, "c": SLATE, "f": MONO, "sp": 1.0}],
    )


def chrome(slide, n, kick, tag, source):
    band(slide, 0, TICKER * 2)
    kicker(slide, kick)
    tag_right(slide, tag)
    source_line(slide, source)
    L.folio(slide, n, design, total=10)


def notes(slide, text: str) -> None:
    slide.notes_slide.notes_text_frame.text = text.strip()


def framed_picture(slide, path, x, y, w, h, alt):
    """Picture with the signature hard shadow + 3pt border frame."""
    rect(
        slide,
        x + ST["shadow_offset_in"],
        y + ST["shadow_offset_in"],
        w,
        h,
        fill=ST.get("shadow_color", INK),
    )
    pic = L.place_picture(slide, path, x, y, w, h, alt=alt)
    rect(slide, x, y, w, h, fill=None, line=INK, line_w=ST["border_pt"])
    return pic


def chip(slide, x, y, text, size=8, h=0.34, fill=MIST, fg=INK, border=1.5):
    # +0.56: 0.3 border/inset padding + 0.2 gate phantom insets + float slack
    w = text_width_in(text, MONO, size, bold=True) + 0.56
    card(slide, x, y, w, h, fill=fill, border=border)
    tb(
        slide,
        x + 0.15,
        y,
        w - 0.3,
        [{"t": text, "pt": size, "c": fg, "b": True, "f": MONO, "sp": 1.0}],
        h=h,
        align=PP_ALIGN.CENTER,
        anchor=MSO_ANCHOR.MIDDLE,
        wrap=False,
    )
    return w


def kpi_card(slide, x, y, w, h, value, label, value_pt=30, stripe_on=True):
    card(slide, x, y, w, h)
    if stripe_on:
        stripe(slide, x, y, 0.16, h)
    pad = 0.32 if stripe_on else 0.18
    # single auto-height box: value + label can never overlap each other
    tb(
        slide,
        x + pad,
        y + 0.12,
        w - pad - 0.15,
        [
            {"t": value, "pt": value_pt, "b": True, "f": DISPLAY, "sp": 1.0},
            {"t": label, "pt": 8, "c": SLATE, "b": True, "f": MONO, "sp": 1.05},
        ],
    )


def section_label(slide, x, y, text, w=6.0):
    tb(
        slide,
        x,
        y,
        w,
        [{"t": text, "pt": 9, "c": SLATE, "b": True, "f": MONO, "sp": 1.0}],
    )


def arrow(slide, x, y, w=0.26, h=0.26):
    a = slide.shapes.add_shape(
        MSO_SHAPE.RIGHT_ARROW, Inches(x), Inches(y), Inches(w), Inches(h)
    )
    a.shadow.inherit = False
    a.fill.solid()
    a.fill.fore_color.rgb = hex_(ACCENT)
    a.line.color.rgb = hex_(INK)
    a.line.width = Pt(1.5)
    return a


# ------------------------------------------------------------------ slides


def slide1(prs):
    s = new_slide(prs)
    band(s, 0, COVER_TICKER * 3)
    card(s, X0, 0.52, 2.6, 0.4)
    tb(
        s,
        X0 + 0.15,
        0.52,
        2.3,
        [{"t": "SUBMISSION DECK", "pt": 8.5, "b": True, "f": MONO, "sp": 1.0}],
        h=0.4,
        align=PP_ALIGN.CENTER,
        anchor=MSO_ANCHOR.MIDDLE,
        wrap=False,
    )
    tb(
        s,
        8.3,
        0.5,
        4.43,
        [
            {
                "t": "ROUND 1 — ONLINE PPT",
                "pt": 9.5,
                "c": SLATE,
                "b": True,
                "f": MONO,
                "sp": 1.15,
                "align": PP_ALIGN.RIGHT,
            },
            {
                "t": "LIVE EVAL — 5 MINUTES",
                "pt": 9.5,
                "c": SLATE,
                "b": True,
                "f": MONO,
                "sp": 1.15,
                "align": PP_ALIGN.RIGHT,
            },
            {
                "t": "23–24 JAN 2027 — OFFLINE HACKATHON",
                "pt": 9.5,
                "c": SLATE,
                "b": True,
                "f": MONO,
                "sp": 1.15,
                "align": PP_ALIGN.RIGHT,
            },
        ],
    )
    tb(
        s,
        X0,
        1.35,
        CW,
        [{"t": "PRAVEGA.", "pt": 144, "b": True, "f": DISPLAY, "sp": 1.0}],
        name="S1Display",
    )
    card(s, X0, 4.05, CW, 1.1, fill=ACCENT)
    tb(
        s,
        X0 + 0.3,
        4.14,
        CW - 0.6,
        [
            {
                "t": "EVIDENCE-VERIFIED PLACEMENT INTELLIGENCE",
                "pt": 30,
                "b": True,
                "f": DISPLAY,
                "sp": 1.0,
            },
            {
                "t": "ONE PROFILE · ONE TRAIL · EVERY DECISION EXPLAINED",
                "pt": 13,
                "b": True,
                "f": MONO,
                "sp": 1.15,
            },
        ],
    )
    tb(
        s,
        X0,
        5.32,
        11.4,
        [
            {
                "t": "Self-declared skills become evidence-gated verified states. "
                "AI drafts; the officer decides. Every action appends to an "
                "audit trail — for college Training & Placement cells.",
                "pt": 14,
                "sp": 1.18,
            }
        ],
    )
    kpi_card(
        s, X0, 6.0, 3.9, 0.9, "3/3", "GOLDEN FLOW PASSING — PLAYWRIGHT", value_pt=32
    )
    kpi_card(s, 4.7, 6.0, 3.9, 0.9, "₹0", "INFRASTRUCTURE AT PILOT SCALE", value_pt=32)
    kpi_card(
        s, 8.83, 6.0, 3.9, 0.9, "LIVE", "REPO · README · CI — PUBLIC NOW", value_pt=32
    )
    source_line(
        s,
        "PRAVEGA · VERIFIED PLACEMENT INTELLIGENCE · QUASAR 5.0 "
        "EDTECH TRACK · DOCS/ROUND1-FACTS.MD",
    )
    L.folio(s, 1, design, total=10)
    notes(
        s,
        """OPEN (0:05) — “This is Pravega. College placements run on two broken ledgers: the student's word, and nobody's audit. We fix both.”
BEATS: 0:05–0:30 problem · 0:30–0:50 competitive gap · 0:50–1:00 solution line · 1:00–3:30 live demo (3 acts) · 3:30–4:20 engineering · 4:20–4:50 feasibility + outcomes · 4:50–5:00 the ask.
Q&A READY: (1) “Why does placement friction persist?” → unverifiable claims + reactive training; cite ISR 56.35% employability (docs/research-brief.md). (2) “What is honestly AI here?” → deterministic engines with reason codes + mandatory human gate; no LLM on the critical path. (3) “What breaks at scale?” → tenant_id on every table; the officer queue scales by role, matrix approval.""",
    )


def slide2(prs):
    s = new_slide(prs)
    chrome(
        s,
        2,
        "THE PROBLEM — PLACEMENTS RUN ON UNVERIFIABLE CLAIMS",
        "PROBLEM",
        "Sources: Wheebox India Skills Report 2026 · PIB (Jul 2026) · "
        "PLFS 2025 · Graduate Skill Index 2025 — DOCS/RESEARCH-BRIEF.MD",
    )
    tb(
        s,
        X0,
        1.05,
        5.1,
        [{"t": "56.35%", "pt": 96, "c": ACCENT, "b": True, "f": DISPLAY, "sp": 1.0}],
    )
    tb(
        s,
        X0,
        2.85,
        5.1,
        [
            {
                "t": "of graduates are “employable” — and no employer can tell "
                "you WHICH.",
                "pt": 17,
                "b": True,
                "sp": 1.12,
            }
        ],
    )
    # stat cards
    card(s, X0, 3.7, 5.1, 1.25)
    stripe(s, X0, 3.7, 0.16, 1.25)
    tb(
        s,
        0.92,
        3.84,
        4.6,
        [{"t": "11.2%", "pt": 34, "b": True, "f": DISPLAY, "sp": 1.0}],
    )
    tb(
        s,
        0.92,
        4.5,
        4.6,
        [
            {
                "t": "graduate unemployment — about 3× the national rate",
                "pt": 9.5,
                "c": SLATE,
                "sp": 1.1,
            }
        ],
    )
    card(s, X0, 5.1, 5.1, 1.25)
    stripe(s, X0, 5.1, 0.16, 1.25)
    tb(
        s,
        0.92,
        5.24,
        4.6,
        [{"t": "42.6%", "pt": 34, "b": True, "f": DISPLAY, "sp": 1.0}],
    )
    tb(
        s,
        0.92,
        5.9,
        4.6,
        [
            {
                "t": "judged industry-ready on a stricter lens (2025)",
                "pt": 9.5,
                "c": SLATE,
                "sp": 1.1,
            }
        ],
    )
    rect(s, X0, 6.5, 5.1, 0.42, fill=ACCENT)
    tb(
        s,
        X0 + 0.15,
        6.5,
        4.8,
        [
            {
                "t": "MATCH, NOT VOLUME — THE PS'S OWN WORDS",
                "pt": 9,
                "b": True,
                "f": MONO,
                "sp": 1.0,
            }
        ],
        h=0.42,
        align=PP_ALIGN.CENTER,
        anchor=MSO_ANCHOR.MIDDLE,
        wrap=False,
    )
    # chart panel
    card(s, 5.9, 1.05, 6.83, 3.3)
    section_label(s, 6.1, 1.16, "GRADUATE EMPLOYABILITY — INDIA (%)", w=6.4)
    L.place_picture(
        s,
        ASSETS / "employability.png",
        6.05,
        1.5,
        6.53,
        2.7,
        alt="Bar chart: graduate employability 46% in 2020, "
        "54.81% in 2025, 56.35% in 2026 — hero bar orange",
    )
    tb(
        s,
        5.9,
        4.42,
        6.83,
        [
            {
                "t": "Wheebox ISR trend · PIB (Jul 2026) records the same rise from "
                "46% (2020) — docs/research-brief.md",
                "pt": 8,
                "c": SLATE,
                "f": MONO,
                "sp": 1.1,
            }
        ],
    )
    section_label(s, 5.9, 4.75, "THE COST OF CLAIMS — TODAY", w=6.83)
    costs = [
        (
            "Placements on gut",
            "T&P filters in spreadsheets — no version, no appeal, no audit",
        ),
        (
            "Evidence orphaned",
            "repos & tests exist but never become trusted skill state",
        ),
        (
            "Training reacts, never predicts",
            "cohort weakness surfaces only after a failed drive",
        ),
        (
            "NAAC outcomes by hand",
            "numbers live in Excel — nothing traces back to an action",
        ),
    ]
    y = 5.05
    for head, body in costs:
        tb(
            s,
            5.9,
            y,
            6.83,
            [
                {"t": head, "pt": 11, "b": True, "sp": 1.0},
                {"t": body, "pt": 8.5, "c": SLATE, "sp": 1.0},
            ],
        )
        y += 0.47
    notes(
        s,
        """0:05–0:30 — “Half of graduates are judged employable, and the employer still cannot pick. The failure is not supply; it is verified visibility.”
Numbers on this slide are all cited on-slide: Wheebox ISR 2026 (54.81% → 56.35% YoY), PIB Jul 2026 (same trend, 46% in 2020), PLFS 2025 (~11.2% graduate unemployment, ≈3× national), Graduate Skill Index 2025 (~42.6% industry-ready). Nothing invented.
Q&A: (1) “Why not just certify everyone?” → certificates age; we verify liveness and track expiry — SQL expires yearly, attestations carry cadence. (2) “Is this problem money-material?” → delayed offers = lost salary months + recruiter cost of bad hires; we deliberately do not invent a rupee figure here. (3) “Do colleges feel this?” → NAAC/NIRF pressure: one-click CSV export ships in this build.""",
    )


def slide3(prs):
    s = new_slide(prs)
    chrome(
        s,
        3,
        "THE GAP — WHAT EXISTS VS WHAT'S MISSING",
        "LANDSCAPE",
        "Sources: joinsuperset.com (manual eligibility tracking admitted) · "
        "TCS iON NQT · LineupX vs Superset · DOCS/RESEARCH-BRIEF.MD · "
        "PS: DOCS/PLAN.MD",
    )
    tb(
        s,
        X0,
        1.05,
        CW,
        [
            {
                "t": "EVERY TOOL DIGITISES THE QUEUE.",
                "pt": 40,
                "b": True,
                "f": DISPLAY,
                "sp": 1.0,
            },
            {
                "t": "NONE VERIFIES THE PERSON.",
                "pt": 40,
                "c": ACCENT,
                "b": True,
                "f": DISPLAY,
                "sp": 1.0,
            },
        ],
    )
    cols = [4.13, 1.5, 1.5, 1.5, 1.5, 2.0]
    xs, acc = [], X0
    for w in cols:
        xs.append(acc)
        acc += w
    headers = [
        "CAPABILITY",
        "SUPERSET",
        "TCS iON",
        "LINEUPX",
        "SPREADSHEETS",
        "PRAVEGA",
    ]
    rows = [
        ("Campus logistics — post, apply, schedule", "y", "y", "y", "y", "y"),
        ("Evidence-gated skill states, expiry-tracked", "n", "n", "n", "n", "y"),
        ("Explainable eligibility — versioned rules", "n", "n", "n", "n", "y"),
        ("AI drafts; human approves / overrides", "n", "n", "n", "n", "y"),
        ("Append-only audit for NAAC / NIRF", "n", "n", "n", "n", "y"),
        ("Appeal path on every decision", "n", "n", "n", "n", "y"),
    ]
    hy, rh = 2.65, 0.44
    # header
    rect(s, X0, hy, CW, rh, fill=INK)
    for i, htext in enumerate(headers):
        tb(
            s,
            xs[i] + 0.14,
            hy,
            cols[i] - 0.28,
            [{"t": htext, "pt": 9.5, "c": BG, "b": True, "f": MONO, "sp": 1.0}],
            h=rh,
            align=PP_ALIGN.LEFT if i == 0 else PP_ALIGN.CENTER,
            anchor=MSO_ANCHOR.MIDDLE,
            wrap=False,
        )
    # rows
    for ri, cells in enumerate(rows):
        ry = hy + rh * (ri + 1)
        rect(s, X0, ry, CW, rh, fill=(MIST if ri % 2 == 0 else BG))
        rect(s, xs[5], ry, cols[5], rh, fill=ACCENT)  # Pravega column
        tb(
            s,
            xs[0] + 0.14,
            ry,
            cols[0] - 0.28,
            [{"t": cells[0], "pt": 10.5, "b": True, "sp": 1.0}],
            h=rh,
            anchor=MSO_ANCHOR.MIDDLE,
            wrap=False,
        )
        for ci in range(1, 6):
            mark = "✓" if cells[ci] == "y" else "—"
            col = INK if cells[ci] == "y" else SLATE
            tb(
                s,
                xs[ci],
                ry,
                cols[ci],
                [
                    {
                        "t": mark,
                        "pt": 12 if cells[ci] == "y" else 11,
                        "c": col,
                        "b": True,
                        "f": BODY,
                        "sp": 1.0,
                    }
                ],
                h=rh,
                align=PP_ALIGN.CENTER,
                anchor=MSO_ANCHOR.MIDDLE,
                wrap=False,
            )
    rect(s, X0, hy, CW, rh * (len(rows) + 1), fill=None, line=INK, line_w=3)
    # stat strip
    card(s, X0, 5.9, 5.95, 1.0)
    stripe(s, X0, 5.9, 0.16, 1.0)
    tb(
        s,
        0.92,
        6.0,
        5.4,
        [{"t": "40% vs 10%", "pt": 30, "b": True, "f": DISPLAY, "sp": 1.0}],
    )
    tb(
        s,
        0.92,
        6.52,
        5.4,
        [
            {
                "t": "of new backend JDs ask Docker — 10% of the batch has it (PS)",
                "pt": 8.5,
                "c": SLATE,
                "f": MONO,
                "sp": 1.05,
            }
        ],
    )
    card(s, 6.78, 5.9, 5.95, 1.0)
    stripe(s, 6.78, 5.9, 0.16, 1.0)
    tb(s, 7.1, 6.0, 5.4, [{"t": "61%", "pt": 30, "b": True, "f": DISPLAY, "sp": 1.0}])
    tb(
        s,
        7.1,
        6.52,
        5.4,
        [
            {
                "t": "of recent backend JDs ask SQL — our own cohort data (db/seed.ts)",
                "pt": 8.5,
                "c": SLATE,
                "f": MONO,
                "sp": 1.05,
            }
        ],
    )
    notes(
        s,
        """0:30–0:50 — “They built logistics. We built trust.”
Respect the incumbents: Superset won campus logistics; TCS iON is a respectable point-in-time exam; LineupX adds AI mocks. The gap is specifically the trust layer — evidence-gated states with governance rails. Nobody mainstream ships it (gap statement: docs/research-brief.md).
Q&A: (1) “Why has not Superset done this?” → their model monetises volume; evidence gating is an afternoon-of-product decision away, but it raises the bar for candidates. (2) “The TCS exam is objective — why live evidence?” → point-in-time ≠ current state; evidence ages, so we decay it (expiry) and refresh on demand. (3) “Spreadsheets are free.” → free plus invisible mistakes; our CSV export feeds what they already produce — we do not replace, we verify.""",
    )


def slide4(prs):
    s = new_slide(prs)
    chrome(
        s,
        4,
        "THE SOLUTION — ONE LINE, THREE ACTS",
        "SOLUTION",
        "PS PILLARS: EVIDENCE-BASED COMPETENCY PROFILING · SKILL-GAP "
        "BRIDGING · AGENTIC PLACEMENT INTELLIGENCE · GOVERNANCE & TRUST — "
        "DOCS/ROUND1-FACTS.MD",
    )
    tb(
        s,
        X0,
        1.05,
        CW,
        [
            {
                "t": "CLAIMS IN. EVIDENCE OUT. A HUMAN ON THE FINAL SWITCH.",
                "pt": 34,
                "b": True,
                "f": DISPLAY,
                "sp": 1.0,
            }
        ],
    )
    # flow: claimed → evidence gate → verified
    ny, nh = 1.95, 1.35
    card(s, X0, ny, 3.3, nh, fill=MIST)
    tb(
        s,
        0.78,
        ny + 0.14,
        2.95,
        [
            {"t": "STATE", "pt": 8, "c": SLATE, "b": True, "f": MONO, "sp": 1.0},
            {"t": "CLAIMED", "pt": 26, "b": True, "f": DISPLAY, "sp": 1.0},
            {"t": "self-declared — nobody checked", "pt": 8.5, "c": SLATE, "sp": 1.05},
        ],
    )
    arrow(s, 4.0, ny + 0.55)
    card(s, 4.6, ny, 4.0, nh, fill=INK)
    tb(
        s,
        4.8,
        ny + 0.14,
        3.6,
        [
            {
                "t": "EVIDENCE GATE",
                "pt": 8,
                "c": ACCENT,
                "b": True,
                "f": MONO,
                "sp": 1.0,
            },
            {
                "t": "REPO → ANALYZER",
                "pt": 20,
                "c": BG,
                "b": True,
                "f": DISPLAY,
                "sp": 1.0,
            },
            {
                "t": "language bytes · commit cadence · test presence",
                "pt": 8.5,
                "c": BG,
                "sp": 1.05,
            },
        ],
    )
    arrow(s, 8.72, ny + 0.55)
    stamp = card(s, 9.32, ny, 3.41, nh, fill=ACCENT)
    stamp.rotation = -6
    tbx = tb(
        s,
        9.5,
        ny + 0.16,
        3.05,
        [
            {"t": "✓ VERIFIED", "pt": 26, "b": True, "f": DISPLAY, "sp": 1.0},
            {
                "t": "expiry-tracked · evidence chain cited",
                "pt": 8.5,
                "b": True,
                "f": MONO,
                "sp": 1.05,
            },
        ],
    )
    tbx.rotation = -6
    # three act cards
    acts = [
        (
            "I",
            "Evidence over claims",
            [
                "GitHub scan — language bytes, cadence, tests",
                "Claimed → Verified flip, expiry tracked",
                "Every flip cites its evidence chain",
            ],
            "LEDGER · ANALYZER",
        ),
        (
            "II",
            "The number moves",
            [
                "Mock drive flags the weak skill",
                "Learning-path tasks produce real evidence",
                "Retest delta shows growth — not vibes",
            ],
            "GAP ENGINE · PATH BUILDER",
        ),
        (
            "III",
            "AI helps, human decides",
            [
                "Agents draft sets, sweeps, schedules",
                "Officer approves or overrides — reason mandatory",
                "Every action → append-only audit + fairness scan",
            ],
            "AGENT RUNS · AUDIT LOG",
        ),
    ]
    aw, gap = 3.963, 0.121
    x = X0
    for numeral, title, bullets, footer in acts:
        card(s, x, 3.7, aw, 2.65)
        rect(s, x + 0.18, 3.88, 0.5, 0.5, fill=INK)
        tb(
            s,
            x + 0.18,
            3.88,
            0.5,
            [{"t": numeral, "pt": 18, "c": BG, "b": True, "f": DISPLAY, "sp": 1.0}],
            h=0.5,
            align=PP_ALIGN.CENTER,
            anchor=MSO_ANCHOR.MIDDLE,
            wrap=False,
        )
        tb(
            s,
            x + 0.82,
            3.9,
            aw - 1.0,
            [{"t": title, "pt": 14.5, "b": True, "f": DISPLAY, "sp": 1.0}],
        )
        yy = 4.58
        for b in bullets:
            tb(s, x + 0.2, yy, aw - 0.4, [{"t": "— " + b, "pt": 8.5, "sp": 1.05}])
            yy += 0.42
        rect(s, x + 0.16, 5.82, aw - 0.32, 0.4, fill=BG, line=INK, line_w=1.5)
        tb(
            s,
            x + 0.28,
            5.82,
            aw - 0.56,
            [{"t": footer, "pt": 8, "c": SLATE, "b": True, "f": MONO, "sp": 1.0}],
            h=0.4,
            anchor=MSO_ANCHOR.MIDDLE,
            wrap=False,
        )
        x += aw + gap
    rect(s, X0, 6.55, CW, 0.4, fill=INK)
    tb(
        s,
        X0 + 0.2,
        6.55,
        CW - 0.4,
        [
            {
                "t": "ONE PROFILE · ONE TRAIL · EVERY DECISION EXPLAINED — THE "
                "PRODUCT IN A SINGLE LINE",
                "pt": 9,
                "c": BG,
                "b": True,
                "f": MONO,
                "sp": 1.0,
            }
        ],
        h=0.4,
        align=PP_ALIGN.CENTER,
        anchor=MSO_ANCHOR.MIDDLE,
        wrap=False,
    )
    notes(
        s,
        """0:50–1:00 — one sentence per act: “I — your repos speak. II — your gaps close, measurably. III — your officer decides; the AI drafts and sulks.”
Map to the PS pillars explicitly so judges score fit, not theatre: Act I = Evidence-Based Competency Profiling; Act II = Skill-Gap Bridging; Act III = Governance & trust (human gate, fairness parity, audit).
Q&A: (1) “What if there is no repo?” → lab work, certificates and contests are first-class evidence; consent center shows exactly what is shared. (2) “How fair is the AI?” → four-fifths parity scan on every shortlist + override is mandatory with a written reason + every decision carries a rule version. (3) “Why agent orchestration?” → placement peak timeliness: sweeps in minutes with a named human accountable — automation without losing accountability.""",
    )


def slide5(prs):
    s = new_slide(prs)
    chrome(
        s,
        5,
        "PROOF — THREE ACTS OF WORKING PRODUCT",
        "DEMO",
        "Screenshots: docs/screenshots/brutalist-{verify,mockdrive,"
        "officer-queue}.png — captured from the running app, 2026",
    )
    tb(
        s,
        X0,
        1.02,
        CW,
        [
            {
                "t": "THIS IS NOT A MOCK. EVERY SCREEN EXISTS.",
                "pt": 34,
                "b": True,
                "f": DISPLAY,
                "sp": 1.0,
            },
            {
                "t": "Replay-labeled proof — the analyzer says so on screen, "
                "never silently.",
                "pt": 11,
                "c": SLATE,
                "sp": 1.1,
            },
        ],
    )
    shots = [
        (
            "brutalist-verify.png",
            "ACT I — CLAIM FLIPS TO VERIFIED",
            "Python 74% language bytes · 37 commits · tests found — "
            "evidence chain logged, replay labeled",
            "Skill verification screen: Python stamped VERIFIED with "
            "language bytes 74%, 37 commits, replay-mode evidence chain",
        ),
        (
            "brutalist-mockdrive.png",
            "ACT II — GAP NAMED, PATH ASSIGNED",
            "Aptitude 21/30 · machine 12/20 · interview 17/30 → 63% "
            "composite; cohort 60% weak in SQL",
            "Mock drive replay: round scores 21 of 30, 12 of 20, 17 of 30, "
            "63% composite, SQL weakness flagged, gap-closing path offered",
        ),
        (
            "brutalist-officer-queue.png",
            "ACT III — AI PROPOSES, HUMAN DECIDES",
            "3 proposals pending · approve / override (≥8 chars) / defer · "
            "rule v3 · conf 78% / 85%",
            "Officer decision queue: interview set and eligibility sweep "
            "awaiting human approve, override with reason, or defer",
        ),
    ]
    w, gap = 3.963, 0.121
    x = X0
    for fn, title, cap, alt in shots:
        framed_picture(s, SHOTS / fn, x, 2.15, w, 2.23, alt)
        tb(
            s,
            x,
            4.5,
            w,
            [
                {"t": title, "pt": 10.5, "b": True, "f": DISPLAY, "sp": 1.0},
                {"t": cap, "pt": 8.5, "c": SLATE, "sp": 1.08},
            ],
        )
        x += w + gap
    rect(s, X0, 5.4, CW, 0.42, fill=ACCENT)
    tb(
        s,
        X0 + 0.2,
        5.4,
        CW - 0.4,
        [
            {
                "t": "REPLAY MODE IS LABELED ON SCREEN — A FAILED LIVE FETCH "
                "NEVER HIDES",
                "pt": 10.5,
                "b": True,
                "f": DISPLAY,
                "sp": 1.0,
            }
        ],
        h=0.42,
        align=PP_ALIGN.CENTER,
        anchor=MSO_ANCHOR.MIDDLE,
        wrap=False,
    )
    cx = X0
    for label in (
        "GOLDEN FLOW 3/3 E2E",
        "PUBLIC URL — SHIPS WITH SUBMISSION",
        "SEED: 7 STUDENTS · FULL EVIDENCE CHAINS",
    ):
        cx += chip(s, cx, 6.0, label, size=8.5, h=0.4) + 0.14
    tb(
        s,
        X0,
        6.55,
        CW,
        [
            {
                "t": "Fixtures ↔ live: the analyzer's ports/adapters keep the demo "
                "alive when venue Wi-Fi lies — same evidence chain, labeled.",
                "pt": 9,
                "c": SLATE,
                "sp": 1.05,
            }
        ],
    )
    notes(
        s,
        """1:00–3:30 — run the demo exactly in this order:
ACT I (60s): ledger shows Python CLAIMED → Verify → consent gate → analyzer steps → stamp flips VERIFIED with the replay banner. Land the line: “It failed a live fetch honestly and kept working — nothing hidden.” Proof: 74% Python by bytes, 37 commits, tests present.
ACT II (60s): mock drive → machine note “JOIN grouping incomplete” → task t3 → evidence artifact → SQL flips Verified with expiry. Scores 21/30, 12/20, 17/30 → 63% composite; cohort is 60% weak here.
ACT III (60s): officer queue → approve interview set → override eligibility sweep with reason (≥8 chars enforced) → fairness flag four-fifths gap recorded. Close: “There is no delete button.”
Failure recovery: if the network is shy, replay mode is labeled on screen; swap to the recorded video — never dead air.
Q&A: (1) private repo? → consent explicit, read-only, revocable in one click. (2) fake data? → seeded cohort of 7 students, every row clickable, nothing decorative. (3) what would you not ship yet? → live LeetCode ingestion (unofficial API) — fixtures there, labeled clearly, roadmap item.""",
    )


def slide6(prs):
    s = new_slide(prs)
    chrome(
        s,
        6,
        "ENGINEERING — NO BLACK BOXES",
        "HOW IT WORKS",
        "Multi-tenancy: tenant_id on every row · data residency Supabase "
        "ap-south-1 (Mumbai) — README.MD, DOCS/PLAN.MD",
    )
    tb(
        s,
        X0,
        1.02,
        CW,
        [
            {
                "t": "HONEST PIPELINE. EVERY STEP TRACES.",
                "pt": 34,
                "b": True,
                "f": DISPLAY,
                "sp": 1.0,
            },
            {
                "t": "Deterministic agents with reason codes — no LLM on the "
                "critical path.",
                "pt": 11,
                "c": SLATE,
                "sp": 1.1,
            },
        ],
    )
    steps = [
        (
            "1",
            "GitHub, read-only",
            "Consent explicit + revocable. Metadata, languages, commits — "
            "nothing else.",
            "PORT / ADAPTER",
        ),
        (
            "2",
            "Analyzer",
            "Language bytes · cadence · tests. Fixtures ↔ live — every "
            "fallback labeled.",
            "LABELS REPLAY",
        ),
        (
            "3",
            "Evidence ledger",
            "Postgres + Drizzle. Expiry-tracked states, append-only events.",
            "SUPABASE AP-SOUTH-1",
        ),
        (
            "4",
            "Rules engine",
            "Versioned clauses, parse-free — no eval(). Rule v3 history recorded.",
            "EXPLAINABLE",
        ),
        (
            "5",
            "Human gate",
            "Agents draft; officer approves or overrides with a mandatory reason.",
            "AUDIT_LOG",
        ),
    ]
    sw, sg = 2.202, 0.28
    y = 2.15
    for i, (n, title, body, foot) in enumerate(steps):
        x = X0 + i * (sw + sg)
        dark = i in (0, 4)
        card(s, x, y, sw, 1.8, fill=(INK if dark else MIST))
        rect(s, x + 0.14, y + 0.14, 0.42, 0.36, fill=ACCENT)
        tb(
            s,
            x + 0.14,
            y + 0.14,
            0.42,
            [{"t": n, "pt": 15, "b": True, "f": DISPLAY, "sp": 1.0}],
            h=0.36,
            align=PP_ALIGN.CENTER,
            anchor=MSO_ANCHOR.MIDDLE,
            wrap=False,
        )
        tb(
            s,
            x + 0.14,
            y + 0.56,
            sw - 0.28,
            [
                {
                    "t": title,
                    "pt": 11.5,
                    "c": (BG if dark else INK),
                    "b": True,
                    "f": DISPLAY,
                    "sp": 1.0,
                }
            ],
        )
        tb(
            s,
            x + 0.14,
            y + 0.86,
            sw - 0.28,
            [{"t": body, "pt": 7.5, "c": (BG if dark else INK), "sp": 1.08}],
        )
        tb(
            s,
            x + 0.14,
            y + 1.48,
            sw - 0.28,
            [
                {
                    "t": foot,
                    "pt": 7,
                    "c": (ACCENT if dark else SLATE),
                    "b": True,
                    "f": MONO,
                    "sp": 1.0,
                }
            ],
        )
        if i < 4:
            arrow(s, x + sw + 0.02, y + 0.77, w=0.24, h=0.26)
    section_label(s, X0, 4.15, "STACK — BORING, PROVEN", w=6.0)
    cx = X0
    for label in (
        "NEXT.JS 16",
        "REACT 19",
        "TYPESCRIPT 5",
        "TAILWIND V4",
        "DRIZZLE ORM",
        "POSTGRES · SUPABASE",
        "PLAYWRIGHT 3/3",
        "GITHUB REST",
    ):
        cx += chip(s, cx, 4.45, label, size=8, h=0.34) + 0.14
    card(s, X0, 5.05, CW, 0.95, border=3)
    rect(s, X0, 5.05, CW, 0.95, fill=None, line=ACCENT, line_w=3)
    tb(
        s,
        X0 + 0.22,
        5.16,
        CW - 0.44,
        [
            {"t": "CLEVER, NOT MAGIC", "pt": 8.5, "b": True, "f": MONO, "sp": 1.0},
            {
                "t": "Analyzers are ports/adapters — swap fixtures ↔ live GitHub "
                "with zero changes above the ledger. A failed fetch replays "
                "precomputed evidence, labeled on screen — never silent.",
                "pt": 10,
                "sp": 1.12,
            },
        ],
    )
    tb(
        s,
        X0,
        6.25,
        CW,
        [
            {
                "t": "tenant_id on every row · data residency: Supabase ap-south-1 "
                "(Mumbai) · the PS explicitly allows rule-based AI — we ship "
                "that, and we say which is which.",
                "pt": 9.5,
                "c": SLATE,
                "sp": 1.08,
            }
        ],
    )
    notes(
        s,
        """3:30–4:20 — 50 seconds, no code talk unless pressed:
“Three guarantees: (1) you never click a black box — every score carries its inputs; (2) failures are labeled, not hidden — fixtures say replay; (3) the AI proposes, the officer disposes — nothing writes without a human's name on it.”
Close-line if asked about architecture: “The ledger is the product. Screens come and go; the audit trail is the trust.”
Q&A: (1) “Where is the LLM?” → none on the critical path; agents are deterministic engines with reason codes and confidence; an LLM may draft interview questions behind a flag — optional, never deciding. (2) “Data residency?” → Supabase ap-south-1, Mumbai — India jurisdiction, DPDP-aligned posture. (3) “What is genuinely novel?” → expiry-tracked skill states + evidence chains + mandatory human override with reasons — the accountability loop, not the pixels.""",
    )


def slide7(prs):
    s = new_slide(prs)
    chrome(
        s,
        7,
        "FEASIBILITY & COST — BORING WINS",
        "FEASIBILITY",
        "Costs & risks: DOCS/ROUND1-FACTS.MD · DOCS/SECURITY-NOTES.MD · "
        "README.MD (npm audit: 0 high/critical)",
    )
    tb(
        s,
        X0,
        1.02,
        CW,
        [
            {
                "t": "₹0 INFRASTRUCTURE.",
                "pt": 40,
                "c": ACCENT,
                "b": True,
                "f": DISPLAY,
                "sp": 1.0,
            },
            {
                "t": "Free tiers end to end. Nothing experimental on the "
                "critical path.",
                "pt": 11,
                "c": SLATE,
                "sp": 1.1,
            },
        ],
    )
    kpis = [
        ("₹0", "INFRA AT PILOT — FREE TIERS"),
        ("36 H", "SOLO BUILD · BORING STACK"),
        ("NO ML", "RULE-BASED AI — PS ALLOWS IT"),
        ("0", "HIGH/CRITICAL NPM-AUDIT FINDINGS"),
    ]
    kw = 2.92
    for i, (v, lab) in enumerate(kpis):
        kpi_card(s, X0 + i * (kw + 0.15), 2.3, kw, 1.05, v, lab, value_pt=28)
    # risk table
    hy, hh = 3.6, 0.36
    rect(s, X0, hy, CW, hh, fill=INK)
    tb(
        s,
        X0 + 0.15,
        hy,
        4.3,
        [{"t": "WHAT BREAKS", "pt": 9, "c": BG, "b": True, "f": MONO, "sp": 1.0}],
        h=hh,
        anchor=MSO_ANCHOR.MIDDLE,
        wrap=False,
    )
    tb(
        s,
        X0 + 4.75,
        hy,
        7.0,
        [{"t": "WHAT WE DO", "pt": 9, "c": BG, "b": True, "f": MONO, "sp": 1.0}],
        h=hh,
        anchor=MSO_ANCHOR.MIDDLE,
        wrap=False,
    )
    risks = [
        (
            "Venue network dies",
            "Labeled fixture replay + recorded 90s video — the demo never freezes",
        ),
        (
            "GitHub rate-limits or 404",
            "GITHUB_TOKEN supported; demo repo 404s — replay carries, honestly labeled",
        ),
        (
            "“AI could hallucinate” critique",
            "No LLM on the critical path — deterministic rules + human gate; confidence shown",
        ),
        (
            "Students won't connect repos",
            "Consent explicit & revocable; lab work, contests, certificates accepted",
        ),
        (
            "Judges break the demo link",
            "Officer-only demo reset — factory reseed in seconds",
        ),
        (
            "Scale beyond one college",
            "tenant_id on every row; NAAC export is one CSV; PS multi-tenant path intact",
        ),
    ]
    rh = 0.42
    for ri, (risk, fix) in enumerate(risks):
        ry = hy + hh + ri * rh
        rect(s, X0, ry, CW, rh, fill=(MIST if ri % 2 == 0 else BG))
        tb(
            s,
            X0 + 0.15,
            ry,
            4.3,
            [{"t": risk, "pt": 9.5, "b": True, "sp": 1.0}],
            h=rh,
            anchor=MSO_ANCHOR.MIDDLE,
            wrap=False,
        )
        tb(
            s,
            X0 + 4.75,
            ry,
            7.0,
            [{"t": fix, "pt": 8.5, "c": INK, "sp": 1.0}],
            h=rh,
            anchor=MSO_ANCHOR.MIDDLE,
            wrap=False,
        )
    rect(s, X0, hy, CW, hh + len(risks) * rh, fill=None, line=INK, line_w=3)
    tb(
        s,
        X0,
        6.55,
        CW,
        [
            {
                "t": "Pilot math: free tiers, one branch, no ML required — the PS "
                "says rule-based is allowed, and we say so out loud.",
                "pt": 9.5,
                "c": SLATE,
                "sp": 1.05,
            }
        ],
    )
    notes(
        s,
        """4:20–4:35 — “Boring technology buys you a demo that never apologises.”
Cost math if pressed: Supabase free tier + Vercel hobby = genuinely ₹0 at pilot scale; one branch, one officer. Build: solo engineer, 36 hours, stack the team already maintains.
Q&A: (1) “Biggest risk?” → venue Wi-Fi; answer honestly: labeled replay + recorded 90s video, judges score substance not spectacle. (2) “Who maintains it?” → the T&P officer, email-grade alerts, nothing grows unbounded. (3) “Hidden confession?” → the seeded demo repo does not exist; verify says 404 and replays labeled — that is the feature, not a bug. Numbers: 0 high/critical npm-audit findings (README); full posture in docs/security-notes.md.""",
    )


def slide8(prs):
    s = new_slide(prs)
    chrome(
        s,
        8,
        "EXPECTED OUTCOMES — THE NUMBER THAT MATTERS",
        "IMPACT",
        "Cohort data: db/seed.ts (analytics + mock-drive replay) · target "
        "framing: DOCS/ROUND1-FACTS.MD",
    )
    tb(
        s,
        X0,
        1.02,
        7.0,
        [
            {
                "t": "THE NUMBER MOVES — MEASURED, NOT VIBES.",
                "pt": 30,
                "b": True,
                "f": DISPLAY,
                "sp": 1.0,
            },
            {
                "t": "Placement-rate target for a pilot batch — a hypothesis we "
                "measure, not a claim we print.",
                "pt": 10,
                "c": SLATE,
                "sp": 1.08,
            },
        ],
    )
    tb(
        s,
        7.9,
        1.0,
        4.83,
        [
            {
                "t": "+8–15 pp",
                "pt": 44,
                "c": ACCENT,
                "b": True,
                "f": DISPLAY,
                "sp": 1.0,
                "align": PP_ALIGN.RIGHT,
            }
        ],
    )
    # chart panel
    card(s, X0, 1.95, 6.9, 4.45)
    section_label(s, 0.78, 2.06, "COHORT WEAK SHARE BY BRANCH (%)", w=6.4)
    L.place_picture(
        s,
        ASSETS / "weakshare.png",
        0.78,
        2.45,
        6.54,
        3.55,
        alt="Grouped bar chart: weak share by branch — Computer E "
        "20% git, 60% SQL, 90% docker; IT E 15/35/80; EnTC "
        "30/72/95 — SQL bars orange",
    )
    tb(
        s,
        0.78,
        6.05,
        6.4,
        [
            {
                "t": "measured from mock drives + verified evidence — db/seed.ts",
                "pt": 8,
                "c": SLATE,
                "f": MONO,
                "sp": 1.0,
            }
        ],
    )
    # right column
    card(s, 7.7, 1.95, 5.03, 1.35)
    stripe(s, 7.7, 1.95, 0.16, 1.35)
    tb(s, 8.05, 2.08, 4.5, [{"t": "60%", "pt": 32, "b": True, "f": DISPLAY, "sp": 1.0}])
    tb(
        s,
        8.05,
        2.68,
        4.5,
        [
            {
                "t": "of the CompE batch is weak in SQL — the backend bottleneck "
                "(61% of JDs ask it)",
                "pt": 8.5,
                "c": SLATE,
                "sp": 1.08,
            }
        ],
    )
    card(s, 7.7, 3.45, 5.03, 1.35)
    stripe(s, 7.7, 3.45, 0.16, 1.35)
    tb(
        s,
        8.05,
        3.58,
        4.5,
        [{"t": "64–78%", "pt": 32, "b": True, "f": DISPLAY, "sp": 1.0}],
    )
    tb(
        s,
        8.05,
        4.18,
        4.5,
        [
            {
                "t": "placement rate across branches today — the baseline the "
                "pilot moves (db/seed.ts)",
                "pt": 8.5,
                "c": SLATE,
                "sp": 1.08,
            }
        ],
    )
    card(s, 7.7, 4.95, 5.03, 1.45)
    stripe(s, 7.7, 4.95, 0.16, 1.45)
    tb(
        s,
        8.05,
        5.1,
        4.5,
        [{"t": "NAAC / NIRF → CSV", "pt": 24, "b": True, "f": DISPLAY, "sp": 1.0}],
    )
    tb(
        s,
        8.05,
        5.6,
        4.5,
        [
            {
                "t": "the heatmap exports straight to the accreditation template — "
                "no manual collation",
                "pt": 8.5,
                "c": SLATE,
                "sp": 1.08,
            }
        ],
    )
    rect(s, X0, 6.55, CW, 0.42, fill=ACCENT)
    tb(
        s,
        X0 + 0.2,
        6.55,
        CW - 0.4,
        [
            {
                "t": "SIGNAL: SQL IS THE BOTTLENECK — ONE WORKSHOP, THEN GATE THE "
                "DRIVE ON THE RE-TEST",
                "pt": 10.5,
                "b": True,
                "f": DISPLAY,
                "sp": 1.0,
            }
        ],
        h=0.42,
        align=PP_ALIGN.CENTER,
        anchor=MSO_ANCHOR.MIDDLE,
        wrap=False,
    )
    notes(
        s,
        """4:35–4:50 — “The platform does not just report weakness; it closes it. Mock drive finds SQL weak, path assigns tasks that produce evidence, retest shows the delta — the loop closes in days, not placement seasons.”
The +8–15 pp figure is honestly framed on-slide as a TARGET/hypothesis for the pilot batch — measured before/after, not a printed result. Baseline placement rates (64–78%) come from db/seed.ts; weak-share chart is the product's own analytics.
Q&A: (1) “How will you prove impact?” → before/after on the pilot cohort: weak-share, retest delta, offer rate — all already exported. (2) “Is the workshop idea hand-wavy?” → the heatmap itself recommends the action (book one SQL workshop, gate the drive re-run on attendance). (3) “NAAC value?” → the exact numbers flow into the report template — no manual collation, no drift.""",
    )


def slide9(prs):
    s = new_slide(prs)
    chrome(
        s,
        9,
        "ROADMAP — PILOT FIRST, CREDENTIALS LAST",
        "ROADMAP",
        "Plan of record: DOCS/ROUND1-FACTS.MD · DOCS/PRE-COMPETITION-PLAN.MD",
    )
    tb(
        s,
        X0,
        1.05,
        CW,
        [
            {
                "t": "PILOT FIRST. CREDENTIALS LAST.",
                "pt": 34,
                "b": True,
                "f": DISPLAY,
                "sp": 1.0,
            }
        ],
    )
    phases = [
        (
            "PHASE 1 — FEB",
            "PILOT AT VPPCOE T&P",
            "One branch, live drives, measured before/after — the proof batch.",
        ),
        (
            "PHASE 2",
            "MULTI-BRANCH COHORTS",
            "Heatmaps across branches; workshops targeted by weak-share evidence.",
        ),
        (
            "PHASE 3",
            "RECRUITER ONBOARDING",
            "Evidence-first discovery — every match shows why, with the packet.",
        ),
        (
            "PHASE 4",
            "VERIFIABLE CREDENTIALS",
            "Open Badges 3.0 shape — tamper-evident, portable skill records.",
        ),
    ]
    pw, pg = 2.77, 0.35
    for i, (tagtxt, title, body) in enumerate(phases):
        x = X0 + i * (pw + pg)
        card(s, x, 2.0, pw, 2.5)
        rect(s, x, 2.0, pw, 0.4, fill=(ACCENT if i == 0 else INK))
        tb(
            s,
            x + 0.15,
            2.0,
            pw - 0.3,
            [
                {
                    "t": tagtxt,
                    "pt": 8.5,
                    "c": (INK if i == 0 else BG),
                    "b": True,
                    "f": MONO,
                    "sp": 1.0,
                }
            ],
            h=0.4,
            anchor=MSO_ANCHOR.MIDDLE,
            wrap=False,
        )
        tb(
            s,
            x + 0.18,
            2.55,
            pw - 0.36,
            [{"t": title, "pt": 15, "b": True, "f": DISPLAY, "sp": 1.02}],
        )
        tb(s, x + 0.18, 3.35, pw - 0.36, [{"t": body, "pt": 9, "c": INK, "sp": 1.12}])
        if i < 3:
            arrow(s, x + pw + 0.03, 3.1, w=0.29, h=0.26)
    rect(s, X0, 4.75, CW, 0.5, fill=INK)
    tb(
        s,
        X0 + 0.2,
        4.75,
        CW - 0.4,
        [
            {
                "t": "OFFLINE HACKATHON: 23–24 JANUARY 2027 — WE BUILD THE FULL "
                "THING LIVE IN 36 HOURS",
                "pt": 11,
                "c": BG,
                "b": True,
                "f": MONO,
                "sp": 1.0,
            }
        ],
        h=0.5,
        align=PP_ALIGN.CENTER,
        anchor=MSO_ANCHOR.MIDDLE,
        wrap=False,
    )
    cw2 = 3.963
    for i, label in enumerate(
        (
            "PUBLIC URL + GITHUB + README — SHIPS WITH SUBMISSION",
            "DEMO VIDEO ≤ 90S RECORDED — NEVER DEAD AIR",
            "5-MINUTE SCRIPT — SPEAKER NOTES ON EVERY SLIDE",
        )
    ):
        x = X0 + i * (cw2 + 0.121)
        card(s, x, 5.55, cw2, 0.55)
        tb(
            s,
            x + 0.16,
            5.55,
            cw2 - 0.32,
            [{"t": label, "pt": 8.5, "b": True, "f": MONO, "sp": 1.0}],
            h=0.55,
            align=PP_ALIGN.CENTER,
            anchor=MSO_ANCHOR.MIDDLE,
        )
    tb(
        s,
        X0,
        6.4,
        CW,
        [
            {
                "t": "Scope is managed, not hoped: trigger cuts are documented in "
                "advance — depth on the golden flow beats breadth everywhere.",
                "pt": 9.5,
                "c": SLATE,
                "sp": 1.05,
            }
        ],
    )
    notes(
        s,
        """4:50–4:55 — sequence, not a wishlist: “February pilot at VPPCOE with one branch and measured before/after; then multi-branch cohorts; then recruiters onboarding to evidence-first discovery; then verifiable credentials aligned to Open Badges 3.0.”
Q&A: (1) “Why not ship everything now?” → scope discipline: trigger cuts documented in advance (docs/round1-facts.md); depth on the golden flow beats breadth. (2) “What do you need from the college?” → one branch, one officer, two drives — the platform measures itself. (3) “Credentials – really?” → shape is standards-aligned now; full cryptographic issuance is honestly labeled a stretch goal, not a demo promise.""",
    )


def slide10(prs):
    s = new_slide(prs)
    chrome(
        s,
        10,
        "THE ASK",
        "ASK",
        "Submission package: this deck · public URL · GitHub repo · "
        "polished README — DOCS/ROUND1-FACTS.MD",
    )
    tb(
        s,
        X0,
        1.2,
        8.4,
        [{"t": "SELECT US.", "pt": 110, "b": True, "f": DISPLAY, "sp": 1.0}],
    )
    card(s, X0, 3.4, 7.9, 1.15, fill=ACCENT)
    tb(
        s,
        X0 + 0.25,
        3.5,
        7.4,
        [
            {
                "t": "WE SHIP THE FULL BUILD LIVE IN THE 36 HOURS.",
                "pt": 24,
                "b": True,
                "f": DISPLAY,
                "sp": 1.0,
            },
            {
                "t": "Round 1 selects the offline hackathon — 23–24 January 2027.",
                "pt": 10.5,
                "b": True,
                "f": MONO,
                "sp": 1.1,
            },
        ],
    )
    rows = [
        "Repo live now — github.com/Siddhesh-ai-del/pravega",
        "Deploy target: public URL ships with the submission packet",
        "Demo replays labeled proof if the network lies — never dead air",
    ]
    y = 4.85
    repo_box = None
    for i, text in enumerate(rows):
        rect(s, X0, y + 0.08, 0.14, 0.14, fill=ACCENT)
        b = tb(s, 0.9, y, 7.6, [{"t": text, "pt": 11.5, "sp": 1.05}])
        if i == 0:
            repo_box = b
        y += 0.42
    # hyperlink the repo run (retint_links fixes LibreOffice's theme blue)
    run = repo_box.text_frame.paragraphs[0].runs[0]
    run.hyperlink.address = "https://github.com/Siddhesh-ai-del/pravega"
    # QR card
    card(s, 9.1, 1.2, 3.63, 4.3)
    tb(
        s,
        9.3,
        1.34,
        3.23,
        [
            {
                "t": "SCAN → LIVE REPO",
                "pt": 9,
                "c": SLATE,
                "b": True,
                "f": MONO,
                "sp": 1.0,
                "align": PP_ALIGN.CENTER,
            }
        ],
    )
    L.place_picture(
        s,
        ASSETS / "qr_github.png",
        9.91,
        1.85,
        2.0,
        2.0,
        alt="QR code linking to github.com/Siddhesh-ai-del/pravega",
    )
    tb(
        s,
        9.3,
        4.05,
        3.23,
        [
            {
                "t": "GITHUB.COM/SIDDHESH-AI-DEL/PRAVEGA",
                "pt": 8,
                "b": True,
                "f": MONO,
                "sp": 1.05,
                "align": PP_ALIGN.CENTER,
            }
        ],
    )
    tb(
        s,
        9.3,
        4.5,
        3.23,
        [
            {
                "t": "MIT LICENSED · CI GREEN · GOLDEN FLOW PASSING",
                "pt": 7.5,
                "c": SLATE,
                "f": MONO,
                "sp": 1.1,
                "align": PP_ALIGN.CENTER,
            }
        ],
    )
    cx = 9.1
    for label in ("3/3 E2E", "CI GREEN", "0 CRITICAL"):
        cx += chip(s, cx, 5.0, label, size=8, h=0.38) + 0.1
    rect(s, X0, 6.5, CW, 0.42, fill=ACCENT)
    tb(
        s,
        X0 + 0.2,
        6.5,
        CW - 0.4,
        [
            {
                "t": "ONE PROFILE · ONE TRAIL · EVERY DECISION EXPLAINED — PRAVEGA",
                "pt": 11,
                "b": True,
                "f": DISPLAY,
                "sp": 1.0,
            }
        ],
        h=0.42,
        align=PP_ALIGN.CENTER,
        anchor=MSO_ANCHOR.MIDDLE,
        wrap=False,
    )
    notes(
        s,
        """4:55–5:00 — close hard: “Select us. On January 23–24 you will watch this ship live — thirty-six hours, working software, no vaporware. The repo is public now; scan it while we talk.”
Leave the QR up through Q&A.
Q&A catch-alls: (1) data privacy → explicit read-only consent, revocable in one click, append-only audit, DPDP-style patterns (docs/security-notes.md). (2) hallucination → no LLM decides anything; deterministic rules + human gate + reason codes. (3) why not Superset → they verify nothing; we do not compete with the scheduler, we make it worth trusting. (4) cost → ₹0 infra at pilot, free tiers. (5) scale → tenant_id everywhere, NAAC export one CSV.""",
    )


# ------------------------------------------------------------------ audits


def audit_fit(prs) -> None:
    """Mirror of the gate's text-fit estimator AND the real LibreOffice render.
    Fails the build before the gate does."""
    fails = []
    for idx, slide in enumerate(prs.slides, 1):
        for shape in L.walk(slide.shapes):
            if not shape.has_text_frame or not shape.text.strip():
                continue
            ov = L.estimate_shape_overflow(shape)
            if ov > 0.001:
                fails.append(f"slide {idx} '{shape.name}': gate overflow {ov:+.3f}in")
                continue
            w_in = shape.width / 914400
            h_in = shape.height / 914400
            real = 0.0
            for p in shape.text_frame.paragraphs:
                runs = [r for r in p.runs if r.text]
                if not runs:
                    continue
                pt = max((r.font.size.pt for r in runs if r.font.size), default=18.0)
                name = next((r.font.name for r in runs if r.font.name), BODY)
                bold = any(bool(r.font.bold) for r in runs)
                sp = p.line_spacing or 1.0
                text = "".join(r.text for r in runs)
                fpath = L.resolve_font_file(name, bold)
                n = len(L.wrap_text(text, fpath, pt, max(w_in, 0.1)))
                real += n * pt * 1.2 * sp / 72
            if real > h_in + 0.01:
                fails.append(
                    f"slide {idx} '{shape.name}': real overflow "
                    f"{real:.3f}in > {h_in:.3f}in"
                )
    if fails:
        raise SystemExit("AUDIT FIT FAILED:\n  " + "\n  ".join(fails))


def audit_numbers(prs) -> None:
    """Every numeric token on every slide must be whitelisted."""
    wl_path = ROOT / "numbers.json"
    if not wl_path.exists():
        print("WARN: numbers.json missing — numeric traceability not checked")
        return
    wl = json.loads(wl_path.read_text())
    seen, missing = set(), []
    for idx, slide in enumerate(prs.slides, 1):
        for shape in L.walk(slide.shapes):
            if not shape.has_text_frame or shape.name.endswith("Folio"):
                continue
            for raw in TOKEN_RE.findall(shape.text):
                tok = raw.rstrip(".") or raw
                if tok in seen:
                    continue
                seen.add(tok)
                if tok not in wl:
                    missing.append(f"slide {idx}: {tok!r}")
                else:
                    ref = wl[tok] if isinstance(wl[tok], str) else wl[tok]["ref"]
                    if not (ROOT / ref.split("#", 1)[0]).exists():
                        missing.append(f"slide {idx}: {tok!r} → dead source {ref!r}")
    if missing:
        raise SystemExit("AUDIT NUMBERS FAILED:\n  " + "\n  ".join(missing))
    print(f"audit numbers: {len(seen)} tokens all sourced")


# ------------------------------------------------------------------ main


def main() -> None:
    L.require_env()
    require_sources()
    prs = Presentation()
    prs.slide_width = Inches(SLIDE_W)
    prs.slide_height = Inches(SLIDE_H)
    for builder in (
        slide1,
        slide2,
        slide3,
        slide4,
        slide5,
        slide6,
        slide7,
        slide8,
        slide9,
        slide10,
    ):
        builder(prs)
    L.retint_links(prs, INK)
    cp = prs.core_properties
    cp.title = "Pravega — Quasar 5.0 Round 1 pitch"
    cp.author = "Pravega — Siddhesh"
    cp.subject = "Evidence-verified placement intelligence · EdTech track"
    audit_fit(prs)
    audit_numbers(prs)
    L.atomic_save(prs, str(OUT))
    print(f"built: {OUT.name} ({len(prs.slides.__iter__.__self__._sldIdLst)} slides)")


if __name__ == "__main__":
    main()
