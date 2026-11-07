#!/usr/bin/env python3
"""Pravega — Round 1 deck builder. Swiss International Typographic style.

Discipline per styles/swiss.json: paper/ink/slate/red exactly once per slide;
flush-left ragged-right; hairline 0.75pt rules; big numerals as graphic
elements; 12-col grid snapped manually at 13.333x7.5in.
"""

from __future__ import annotations
from pathlib import Path
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn
from pptx.opc.constants import RELATIONSHIP_TYPE as RT
from PIL import Image

ROOT = Path("/home/siddhesh/Projects/Quasar 5.0: 36-Hour International Hackathon")
ASSETS = ROOT / ".deck_assets"

INK = "000000"
PAPER = "FFFFFF"
SLATE = "757575"
RED = "E62B1E"

EMU_IN = 914400
SLIDE_W = 13.333
SLIDE_H = 7.5


def hex_(v: str) -> RGBColor:
    return RGBColor.from_string(v)


def add_rect(slide, x, y, w, h, fill=None, line=None, line_w=None):
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
        s.line.width = Pt(line_w or 0.75)
    return s


def tb(slide, x, y, w, h, lines, name=None, anchor=None, wrap=True):
    """lines: list of (text, size, color, bold, spacing_before, alignment)"""
    box = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    box.text_frame.word_wrap = wrap
    if anchor:
        box.text_frame.vertical_anchor = anchor
    if name:
        box.name = name
    tf = box.text_frame
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    p0 = tf.paragraphs[0]
    for i, spec in enumerate(lines):
        text, size, color, bold, spacing, align = spec
        p = p0 if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.line_spacing = 1.12
        if spacing is not None:
            p.space_before = Pt(spacing)
        r = p.add_run()
        r.text = text
        r.font.name = "Fira Sans"
        r.font.size = Pt(size)
        r.font.bold = bold
        r.font.color.rgb = hex_(color)
    return box


def rule(slide, y, x=0.6, w=12.13, color=INK, width=0.75):
    line = slide.shapes.add_connector(1, Inches(x), Inches(y), Inches(x + w), Inches(y))
    line.line.color.rgb = hex_(color)
    line.line.width = Pt(width)
    line.shadow.inherit = False
    return line


def kicker(slide, text, right=None, x=0.6, y=0.45, w=12.13):
    tb(slide, x, y, 7.5, 0.3, [(text, 9, SLATE, True, None, PP_ALIGN.LEFT)])
    tb(
        slide,
        x + w - 3.0,
        y,
        3.0,
        0.3,
        [(right or "", 9, SLATE, True, None, PP_ALIGN.RIGHT)],
    )


def folio(slide, n, total=10):
    tb(
        slide,
        12.35,
        7.14,
        0.55,
        0.2,
        [(f"{n:02d} / {total}", 9, SLATE, False, None, PP_ALIGN.RIGHT)],
    )


def footnote(slide, text):
    tb(slide, 0.6, 7.08, 12.13, 0.25, [(text, 7.5, SLATE, False, None, PP_ALIGN.LEFT)])


def chip_filled(slide, x, y, w, text, fill=INK, text_color=PAPER, size=8.5, h=0.30):
    add_rect(slide, x, y, w, h, fill=fill)
    tb(
        slide,
        x,
        y + 0.032,
        w,
        h,
        [(text, size, text_color, True, None, PP_ALIGN.CENTER)],
    )


def pic(slide, path, x, y, w, h, alt):
    p = slide.shapes.add_picture(str(path), Inches(x), Inches(y), Inches(w), Inches(h))
    p.name = Path(path).stem
    p._element._nvXxPr.cNvPr.set("descr", alt)
    return p


def new_pres():
    prs = Presentation()
    prs.slide_width = Inches(SLIDE_W)
    prs.slide_height = Inches(SLIDE_H)
    return prs


def blank(prs):
    return prs.slides.add_slide(prs.slide_layouts[6])


def set_notes(slide, text):
    slide.notes_slide.notes_text_frame.text = text.strip()


def grid_line_label(slide, label):
    tb(slide, 0.6, 7.28, 12.13, 0.2, [(label, 6, SLATE, False, None, PP_ALIGN.LEFT)])


# ============================================================ S1 — COVER


def slide1(prs):
    s = blank(prs)
    # top band: event + track
    kicker(s, "QUASAR 5.0 — ROUND 1 · EDTECH TRACK", right="VPPCOE · T&P CELL")
    rule(s, 0.85)
    # display type block
    tb(
        s,
        0.6,
        1.55,
        12.13,
        3.0,
        [
            ("Pravega.", 132, INK, True, None, PP_ALIGN.LEFT),
        ],
    )
    tb(
        s,
        0.6,
        3.95,
        12.13,
        1.4,
        [
            ("Placements don’t run on claims.", 30, INK, True, None, PP_ALIGN.LEFT),
            (
                "Ours run on evidence — visible, explainable, auditable.",
                30,
                INK,
                False,
                2,
                PP_ALIGN.LEFT,
            ),
        ],
    )
    # red sentinel: single accent instance
    add_rect(s, 0.6, 5.62, 1.6, 0.10, fill=RED)
    # bottom row: artefact strip
    tb(
        s,
        0.6,
        6.05,
        12.13,
        1.0,
        [
            (
                "Agentic placement intelligence — live prototype: evidence-gated skills, closed-loop learning paths, human-approved AI.",
                13,
                INK,
                False,
                None,
                PP_ALIGN.LEFT,
            ),
            (
                "Live URL + GitHub: being wired for Round-1 judging",
                9,
                SLATE,
                False,
                6,
                PP_ALIGN.LEFT,
            ),
        ],
    )
    grid_line_label(s, "PRAVEGA · ROUND 1 · PPT DELIBERATION VERSION · 2026")
    folio(s, 1)
    set_notes(
        s,
        """OPEN (0:05): “This is Pravega. Placement runs on two broken ledgers — the student's word, and nobody's audit. We fix both.”
Beat structure: 0:05–0:30 problem · 0:30–0:50 gap · 0:50–1:00 one-line solution · 1:00–3:30 live demo (3 acts) · 3:30–4:20 architecture · 4:20–4:50 outcomes+ask · 4:50–5:00 close.
Judge Q&A map — have ready: (1) “Why does placement friction persist?” → unverifiable claims + reactive training (answer with ISR 56.35%). (2) “What is honestly AI here?” → deterministic engines + reason codes + human gate; LLM optional, never blocking (crisp). (3) “What breaks at scale?” → Postgres tenancy model, tenant_id everywhere; matrix approve gate scales by role.""",
    )


# ============================================================ S2 — THE PROBLEM


def slide2(prs):
    s = blank(prs)
    kicker(
        s, "THE PROBLEM — what the room already knows but can't see", right="PROBLEM"
    )
    rule(s, 0.85)
    # headline: red numeral
    tb(
        s,
        0.6,
        1.05,
        12.13,
        1.9,
        [
            ("56.35%", 100, RED, True, None, PP_ALIGN.LEFT),
            (
                "of graduates are “employable” — and no employer can tell you which.",
                21,
                INK,
                True,
                4,
                PP_ALIGN.LEFT,
            ),
        ],
    )
    # two evidence columns, divided by rule
    rule(s, 4.12, x=0.6, w=12.13)
    # left column: three sourced facts, separated by hairlines
    tb(
        s,
        0.6,
        4.28,
        6.0,
        0.25,
        [("THE NUMBERS WE STOOD ON", 9, SLATE, True, None, PP_ALIGN.LEFT)],
    )
    facts = [
        (
            "54.81% → 56.35%",
            "YoY employability (Wheebox ISR 2026; PIB July 2026 records the same trend: 46% in 2020 → 56.4%)",
        ),
        (
            "11.2%",
            "graduate unemployment — ≈3× national rate (Raysolute analysis of PLFS 2025)",
        ),
        (
            "Match ≠ volume",
            "employers can’t shortlist from paper claims; skill mismatch is the binding cost, not degree count",
        ),
    ]
    y = 4.66
    for big, small in facts:
        tb(s, 0.6, y, 6.0, 0.28, [(big, 15, INK, True, None, PP_ALIGN.LEFT)])
        tb(
            s,
            0.6,
            y + 0.24,
            6.0,
            0.42,
            [(small, 8.5, SLATE, False, None, PP_ALIGN.LEFT)],
        )
        if (big, small) != facts[-1]:
            rule(s, y + 0.62, x=0.6, w=6.0, width=0.5)
        y += 0.68
    # right column: the cost of claims
    tb(
        s,
        7.35,
        4.28,
        5.4,
        0.25,
        [("THE COST OF CLAIMS — today", 9, SLATE, True, None, PP_ALIGN.LEFT)],
    )
    costs = [
        (
            "Placements on gut",
            "T&P filters × spreadsheets; no version, no appeal, no audit",
        ),
        (
            "Evidence orphaned",
            "GitHub & tests exist but never become trusted skill state",
        ),
        (
            "Training reacts, not predicts",
            "cohort weakness known only after a failed drive",
        ),
        (
            "NAAC outcomes compiled by hand",
            "numbers live in Excel; nothing traces to an action",
        ),
    ]
    y = 4.66
    for head, body in costs:
        tb(s, 7.35, y, 5.4, 0.24, [(head, 11.5, INK, True, None, PP_ALIGN.LEFT)])
        tb(
            s,
            7.35,
            y + 0.19,
            5.4,
            0.35,
            [(body, 8.5, SLATE, False, None, PP_ALIGN.LEFT)],
        )
        y += 0.55
    footnote(
        s,
        "Sources: Wheebox India Skills Report 2026 (PDF, wheebox.com) · PIB “Empowering India’s Skill Ecosystem” (Jul 2026) · Raysolute analysis of PLFS 2025 · PS pages 13–18 (40% JDs ask Docker vs 10% batch has it).",
    )
    folio(s, 2)
    set_notes(
        s,
        """0:05–0:30 — “Half of graduates are judged employable, and the employer still can't pick. The failure isn't supply; it's verified visibility.”
Every number on slide is traceable: Wheebox PDF figure, PIB bulletin, PLFS summary — name them if pressed: “We cite them on the slide; nothing invented.”
PS anchoring: “The problem statement calls this 'match, not volume' — our entire design answers the 'match' half.” 40%/10% Docker stat comes straight from the PS, cite it as such.
Q&A: (1) “Why not just certify everyone?” → certificates age; we verify liveness and track expiry (SQL expires annually; Git attestation has review cadence). (2) “Is the problem really ₹-material?” → delayed placements = lost salary months + recruiter cost of bad hires; not quantified here on purpose — nothing invented. (3) “Colleges have NAAC pressure?” → one-click CSV outcomes export ships in this build (show heatmap if asked).""",
    )


# ============================================================ S3 — THE GAP


def slide3(prs):
    s = blank(prs)
    kicker(s, "THE GAP — what exists vs what’s missing", right="LANDSCAPE")
    rule(s, 0.85)
    tb(
        s,
        0.6,
        1.02,
        12.13,
        0.85,
        [
            ("Every tool digitises the queue —", 38, INK, True, None, PP_ALIGN.LEFT),
            ("none verifies the person.", 38, RED, True, 4, PP_ALIGN.LEFT),
        ],
    )
    # table
    x0, y0 = 0.6, 2.65
    col_w = [4.9, 1.7, 1.6, 1.6, 1.83]
    headers = ["CAPABILITY", "SUPERSET", "TCS iON", "LINEUPX", "PRAVEGA"]
    xs = [x0]
    for w in col_w[:-1]:
        xs.append(xs[-1] + w)
    rows = [
        ("Campus logistics — post, apply, schedule", "yes", "partial", "yes", "yes"),
        ("Evidence-gated skills from real work", "—", "—", "—", "yes"),
        ("Explainable eligibility, versioned rules", "—", "—", "—", "yes"),
        ("AI proposes, human approves/overrides", "—", "—", "—", "yes"),
        ("Append-only audit for NAAC/NIRF", "—", "—", "—", "yes"),
        ("Every action questioned — appeal path", "—", "—", "—", "yes"),
    ]
    row_h = 0.42
    hy = y0
    add_rect(s, x0, hy, sum(col_w), row_h, fill=INK)
    for i, htext in enumerate(headers):
        tb(
            s,
            xs[i] + 0.15,
            hy + 0.075,
            col_w[i] - 0.3,
            0.28,
            [(htext, 10, PAPER, True, None, PP_ALIGN.LEFT)],
        )
    for ri, (cells) in enumerate(rows):
        ry = hy + row_h * (ri + 1)
        fill = PAPER if ri % 2 == 0 else "F4F4F0"
        add_rect(s, x0, ry, sum(col_w), row_h, fill=fill)
        for i, cell in enumerate(cells):
            if i == 0:
                tb(
                    s,
                    xs[0] + 0.15,
                    ry + 0.09,
                    col_w[0] - 0.3,
                    0.26,
                    [(cell, 11, INK, True, None, PP_ALIGN.LEFT)],
                )
            else:
                is_p = i == 4
                tb(
                    s,
                    xs[i] + 0.15,
                    ry + 0.09,
                    col_w[i] - 0.3,
                    0.26,
                    [(cell, 11, (RED if is_p else INK), is_p, None, PP_ALIGN.LEFT)],
                )
    rule(s, hy + row_h * (len(rows) + 1), width=0.75)
    tb(
        s,
        0.6,
        hy + row_h * (len(rows) + 1) + 0.14,
        12.13,
        0.3,
        [
            (
                "The missing middle: evidence-gated skills with governance rails — nobody ships this today.",
                12,
                INK,
                True,
                None,
                PP_ALIGN.LEFT,
            ),
        ],
    )
    footnote(
        s,
        "Product pages + Superset’s own claim: teams “manually track student eligibility” (joinsuperset.com, verified 2026-11) · TCS iON NQT = a point-in-time exam, not a live trust layer · LineupX adds AI mocks, not evidence-gated states.",
    )
    folio(s, 3)
    set_notes(
        s,
        """0:30–0:50 — “They built logistics. We built trust.”
Never bash competitors by name with contempt; respect what exists: Superset won logistics; TCS iON is a respectable exam. Our gap is specifically the trust layer.
The one-liner for Q&A: “We don't compete with the scheduler — we make the scheduler worth trusting.”
(1) “Why hasn’t Superset done this?” → their model monetises volume; evidence-gating raises the bar for candidates — afternoon of product, not an overnight feature. (2) “TCS iON exam is objective — why need live evidence?” → point-in-time ≠ current state; evidence ages; we decay it (expiry) and refresh on demand. (3) “Spreadsheets are free.” → free, plus invisible mistakes; our CSV export feeds what they already produce — we don't replace, we verify.""",
    )


# ============================================================ S4 — THE SOLUTION


def slide4(prs):
    s = blank(prs)
    kicker(s, "THE SOLUTION — in one line", right="ANSWER")
    rule(s, 0.85)
    tb(
        s,
        0.6,
        1.02,
        12.13,
        0.95,
        [
            (
                "Pravega turns claims into evidence —",
                42,
                INK,
                True,
                None,
                PP_ALIGN.LEFT,
            ),
            (
                "with a human always on the final switch.",
                42,
                INK,
                True,
                2,
                PP_ALIGN.LEFT,
            ),
        ],
    )
    # three act cards
    acts = [
        (
            "I",
            "Evidence over claims",
            [
                (
                    "GitHub repo scan — language bytes, commit cadence, tests present",
                    8.5,
                ),
                ("Claimed → Verified flip with expiry tracked", 8.5),
                ("Every flip cites its evidence chain — nothing magic", 8.5),
            ],
            "parts: ledger · analyzer",
        ),
        (
            "II",
            "The number moves",
            [
                ("Mock drive → weak SQL flagged → AI assigns path", 8.5),
                ("Tasks produce evidence — artifact closes the gap", 8.5),
                ("Retest delta shows the growth, not the vibes", 8.5),
            ],
            "parts: gap engine · path builder",
        ),
        (
            "III",
            "AI helps, human decides",
            [
                ("Agents draft: interview set, eligibility sweep, schedule", 8.5),
                ("Officer approves or overrides — reason mandatory", 8.5),
                ("Every action → append-only audit; fairness parity scan", 8.5),
            ],
            "parts: agent runs · audit log",
        ),
    ]
    card_w, gap = 3.97, 0.11
    y = 2.6
    x = 0.6
    for numeral, title, bullets, footer in acts:
        add_rect(s, x, y, card_w, 3.6, fill=PAPER, line=INK, line_w=0.75)
        add_rect(s, x, y, 0.62, 0.62, fill=INK)
        tb(
            s,
            x,
            y + 0.045,
            0.62,
            0.5,
            [(numeral, 26, PAPER, True, None, PP_ALIGN.CENTER)],
        )
        tb(
            s,
            x + 0.78,
            y + 0.065,
            card_w - 0.9,
            0.42,
            [(title, 15.5, INK, True, None, PP_ALIGN.LEFT)],
        )
        yy = y + 0.82
        for body, _ in bullets:
            tb(
                s,
                x + 0.25,
                yy,
                card_w - 0.5,
                0.52,
                [("— " + body, 8.5, INK, False, None, PP_ALIGN.LEFT)],
            )
            yy += 0.6
        add_rect(s, x, y + 3.08, card_w, 0.52, fill="F4F4F0")
        tb(
            s,
            x + 0.18,
            y + 3.19,
            card_w - 0.36,
            0.3,
            [(footer, 8, SLATE, True, None, PP_ALIGN.LEFT)],
        )
        x += card_w + gap
    tb(
        s,
        0.6,
        6.45,
        12.13,
        0.3,
        [
            (
                "One profile · one trail · every decision explained — PS pillar: Evidence-Based Competency Profiling, Skill-Gap Bridging, Agentic Placement, Governance.",
                10,
                INK,
                True,
                None,
                PP_ALIGN.LEFT,
            ),
        ],
    )
    folio(s, 4)
    set_notes(
        s,
        """0:50–1:00 — one sentence each: “I — your repos speak. II — your gaps close, measurably. III — your officer decides; the AI sulks.”
Map explicitly to the PS’s own pillars so judges score the fit, not the theatre: Evidence-Based Competency Profiling (Act I) = PS essential 1–2; Skill-Gap Bridging (Act II) = essential 4–6; Governance/Explainability (Act III) = business requirements on trust & multi-tenancy.
Q&A: (1) “What if there’s no repo?” → lab work, certificates, contests are accepted as first-class evidence (PS allows non-GitHub proof) — show the consent-center screen if pressed. (2) “How fair is the AI?” → dimension: four-fifths parity scan on shortlists + human override is mandatory + every decision carries rule version. (3) “Why agent orchestration matters here?” → timeliness at placement peak: sweeps in minutes, with named human accountable — not automation removing accountability.""",
    )


# ============================================================ S5 — LIVE DEMO


def slide5(prs):
    s = blank(prs)
    kicker(s, "PROOF — 90 SECONDS OF WORKING PRODUCT", right="DEMO")
    rule(s, 0.85)
    tb(
        s,
        0.6,
        1.02,
        12.13,
        0.62,
        [
            ("This is not a mock.", 38, INK, True, None, PP_ALIGN.LEFT),
            (
                "Every screen exists — and the demo replays labeled proof.",
                13,
                SLATE,
                False,
                2,
                PP_ALIGN.LEFT,
            ),
        ],
    )
    props = [
        (
            "verify-result.png",
            "ACT I — claim flips to Verified",
            "Language bytes 74% Python · 37 commits · tests found · evidence chain logged",
            "flat",
        ),
        (
            "mock-drive.png",
            "ACT II — gap named, gate passed",
            "Aptitude 21/30 · Machine 12/20 · Interview 17/30 — SQL weakness flagged, live SQL gate PASS",
            "flat",
        ),
        (
            "officer-queue.png",
            "ACT III — proposals, human decides",
            "Interview set drafted · eligibility sweep blocked 2 (rule v3) · schedule clash flagged",
            "flat",
        ),
    ]
    labels = ["I", "II", "III"]
    card_w, gap = 3.97, 0.11
    x = 0.6
    y = 2.15
    img_h = 3.05
    for (img, title, cap, _), act in zip(props, labels):
        p = ASSETS / img
        # frame with hairline border, Swiss receipt style
        pic(s, p, x, y, card_w, img_h, f"Screenshot of {title}")
        add_rect(s, x, y, card_w, img_h, fill=None, line=INK, line_w=0.75)
        tb(
            s,
            x,
            y + img_h + 0.12,
            card_w,
            0.3,
            [(f"{act} — {title}", 11, INK, True, None, PP_ALIGN.LEFT)],
        )
        tb(
            s,
            x,
            y + img_h + 0.38,
            card_w,
            0.72,
            [(cap, 8, SLATE, False, None, PP_ALIGN.LEFT)],
        )
        x += card_w + gap
    tb(
        s,
        0.6,
        6.85,
        12.13,
        0.25,
        [
            (
                "Live on a public URL — judges click, data is sealed demo data. Fixtures-replay is labeled on screen; never silent.",
                9,
                SLATE,
                False,
                None,
                PP_ALIGN.LEFT,
            ),
        ],
    )
    folio(s, 5)
    set_notes(
        s,
        """1:00–3:30 — run the demo exactly in this order:
ACT I (60s): Ledger shows Python CLAIMED → click Verify → consent gate → analyzer steps (4 checks) → stamp flips VERIFIED, replay-labeled banner. Land the line: “It failed a live fetch honestly and kept working — nothing hidden.”
ACT II (60s): Mock Drive → show machine-test note ('JOIN grouping incomplete') → open task t3 → tick → evidence artifact created → back to ledger → SQL Verified, expires Sep 2027.
ACT III (60s): Officer queue → approve interview set → override eligibility sweep with reason → defer schedule. Fairness check: flag shows four-fifths gap; outcome recorded. Close audit trail: “There is no delete button.”
Failure recovery (if live breaks): “Network’s shy — replay mode is labeled, same evidence chain.” Swap to the recorded 90s video (in repo) — never dead air.
Q&A: (1) “What if the REPO is private?” → consent is explicit, read-only, revocable anytime — revocation is one click (show Consent center). (2) “Is the demo data fake?” → seeded realistic cohort (7 students, real names, full evidence chains); verify by clicking any row — nothing is decorative. (3) “What would you NOT ship yet?” → live LeetCode ingestion (API unofficial) — we use fixtures there, label clearly, roadmap item.""",
    )


# ============================================================ S6 — ENGINEERING


def slide6(prs):
    s = blank(prs)
    kicker(s, "ENGINEERING — no black boxes", right="HOW IT WORKS")
    rule(s, 0.85)
    tb(
        s,
        0.6,
        1.02,
        12.13,
        0.62,
        [
            ("Honest pipeline.", 38, INK, True, None, PP_ALIGN.LEFT),
            (
                "Everything traces. Nothing improvises when nobody's watching.",
                13,
                SLATE,
                False,
                2,
                PP_ALIGN.LEFT,
            ),
        ],
    )
    # five-step flow, arrows between
    steps = [
        (
            "1",
            "GitHub, read-only",
            "Consent explicit + revocable; metadata, languages, commits only",
        ),
        (
            "2",
            "Analyzer",
            "Language bytes · cadence · tests; fixtures↔live ports — every fallback labeled",
        ),
        (
            "3",
            "Evidence ledger",
            "Postgres + Drizzle · expiry-tracked states · append-only events",
        ),
        (
            "4",
            "Rules engine",
            "Versioned clauses — parse-free, no eval(), recorded v1→v3 history",
        ),
        (
            "5",
            "Human gate",
            "Agents draft; officer approves / overrides (mandatory reason) · audit_log",
        ),
    ]
    x, y = 0.6, 2.35
    step_w, gap_w = 2.06, 0.33
    for i, (n, title, body) in enumerate(steps):
        add_rect(
            s,
            x,
            y,
            step_w,
            2.15,
            fill=INK if i in (0, 4) else PAPER,
            line=INK,
            line_w=0.75,
        )
        fg = PAPER if i in (0, 4) else INK
        sub = "A" if i in (0, 4) else "757575"
        tb(
            s,
            x + 0.15,
            y + 0.14,
            step_w - 0.3,
            0.32,
            [
                (
                    n,
                    16,
                    (RED if i == 4 else (PAPER if i in (0, 4) else INK)),
                    True,
                    None,
                    PP_ALIGN.LEFT,
                )
            ],
        )
        tb(
            s,
            x + 0.15,
            y + 0.5,
            step_w - 0.3,
            0.3,
            [(title, 10.5, fg, True, None, PP_ALIGN.LEFT)],
        )
        tb(
            s,
            x + 0.15,
            y + 0.82,
            step_w - 0.3,
            1.18,
            [
                (
                    body,
                    7.2,
                    (PAPER if i in (0, 4) else "2E3138"),
                    False,
                    None,
                    PP_ALIGN.LEFT,
                )
            ],
        )
        if i < len(steps) - 1:
            ar = s.shapes.add_shape(
                MSO_SHAPE.RIGHT_ARROW,
                Inches(x + step_w + 0.015),
                Inches(y + 0.88),
                Inches(0.3),
                Inches(0.28),
            )
            ar.shadow.inherit = False
            ar.fill.solid()
            ar.fill.fore_color.rgb = hex_(INK)
            ar.line.fill.background()
        x += step_w + gap_w
    # stack strip
    y = 5.15
    tb(
        s,
        0.6,
        y,
        12.13,
        0.25,
        [("STACK — BORING, PROVEN", 9, SLATE, True, None, PP_ALIGN.LEFT)],
    )
    chip_x = 0.6
    for label in [
        "Next.js 16",
        "React 19",
        "TypeScript",
        "Tailwind v4",
        "Drizzle ORM",
        "Postgres · Supabase",
        "Playwright · 3/3",
        "GitHub REST",
    ]:
        w = 0.16 + 0.098 * len(label)
        chip_filled(
            s, chip_x, y + 0.35, w, label, fill=INK, text_color=PAPER, size=8, h=0.34
        )
        chip_x += w + 0.13
    # clever-part callout
    y = 6.15
    add_rect(s, 0.6, y, 12.13, 0.55, fill=PAPER, line=RED, line_w=1.5)
    tb(
        s,
        0.82,
        y + 0.075,
        11.7,
        0.2,
        [("CLEVER, NOT MAGIC", 8, RED, True, None, PP_ALIGN.LEFT)],
    )
    tb(
        s,
        0.82,
        y + 0.25,
        11.7,
        0.25,
        [
            (
                "Analyzers are ports/adapters — swap fixtures ↔ live GitHub with zero changes above the ledger. Labeled fallback, never silent.",
                8.5,
                INK,
                False,
                None,
                PP_ALIGN.LEFT,
            )
        ],
    )
    footnote(
        s,
        "Multi-tenancy by design: tenant_id on every table · PS explicitly allows rule-based AI — we ship both, and we say which is which.",
    )
    folio(s, 6)
    set_notes(
        s,
        """3:30–4:20 — 50 seconds, no code talk unless pressed:
“Three guarantees: (1) You never click a black box; every score carries its inputs. (2) Failures are labeled, not hidden — fixtures say ‘replay’. (3) The AI proposes; the officer disposes — nothing writes without a human's name on it.”
Your smartest close if asked about the architecture: “The ledger is the product. Screens come and go; the audit trail is the trust.”
Q&A: (1) “Where's the LLM?” → none on the critical path; agents are deterministic engines with reason codes and confidence; an LLM may draft interview questions behind a flag — optional, never blocking, never deciding. (2) “Data residency?” → all data in Supabase ap-south-1 (Mumbai) — India jurisdiction; DPDP-aligned posture. (3) “What's genuinely novel?” → expiry-tracked skill states + evidence chains + mandatory human override with reasons — novelty is the accountability loop, not the pixels.""",
    )


# ============================================================ S7 — FEASIBILITY


def slide7(prs):
    s = blank(prs)
    kicker(s, "FEASIBILITY & COST — boring wins", right="FEASIBILITY")
    rule(s, 0.85)
    tb(
        s,
        0.6,
        1.02,
        12.13,
        0.62,
        [
            ("₹0 infrastructure.", 44, INK, True, None, PP_ALIGN.LEFT),
            (
                "Real software. Nothing experimental on the critical path.",
                13,
                SLATE,
                False,
                2,
                PP_ALIGN.LEFT,
            ),
        ],
    )
    # risk → mitigation table
    x0, y0 = 0.6, 2.1
    col_w = [4.6, 7.53]
    hy = y0
    add_rect(s, x0, hy, sum(col_w), 0.34, fill=INK)
    tb(
        s,
        x0 + 0.15,
        hy + 0.06,
        col_w[0] - 0.3,
        0.25,
        [("WHAT BREAKS", 9, PAPER, True, None, PP_ALIGN.LEFT)],
    )
    tb(
        s,
        x0 + col_w[0] + 0.15,
        hy + 0.06,
        col_w[1] - 0.3,
        0.25,
        [("WHAT WE DO", 9, PAPER, True, None, PP_ALIGN.LEFT)],
    )
    risks = [
        (
            "Venue network dies",
            "Labeled fixtures replay + recorded 90-second video — demo never freezes",
        ),
        (
            "GitHub API rate-limits / 404",
            "GITHUB_TOKEN support; the demo repo 404 now — replay carries, honestly labeled",
        ),
        (
            "“AI could hallucinate” critique",
            "No LLM on the critical path — deterministic rules + human gate; confidence shown",
        ),
        (
            "“Students won’t connect repos”",
            "Consent is explicit & revocable; non-repo evidence accepted (labs, contests, certs)",
        ),
        (
            "Judges break the demo link",
            "Demo-mode reset button (officer-only, 1/min) — factory reseed in seconds",
        ),
        (
            "Scale beyond one college",
            "tenant_id on every row; NAAC export is one CSV; PS multi-tenant path intact",
        ),
    ]
    row_h = 0.47
    for ri, (r, m) in enumerate(risks):
        ry = hy + 0.34 + ri * row_h
        add_rect(
            s, x0, ry, sum(col_w), row_h, fill=(PAPER if ri % 2 == 0 else "F4F4F0")
        )
        tb(
            s,
            x0 + 0.15,
            ry + 0.09,
            col_w[0] - 0.3,
            0.3,
            [(r, 9.5, INK, True, None, PP_ALIGN.LEFT)],
        )
        tb(
            s,
            x0 + col_w[0] + 0.15,
            ry + 0.09,
            col_w[1] - 0.3,
            0.3,
            [(m, 8.5, "2E3138", False, None, PP_ALIGN.LEFT)],
        )
    rule(s, hy + 0.34 + len(risks) * row_h, width=0.75)
    tb(
        s,
        0.6,
        hy + 0.34 + len(risks) * row_h + 0.08,
        12.13,
        0.24,
        [
            (
                "Cost: ₹0 infra (free tiers) · build: 1 engineer · 36 hours · demo seed: 7 realistic students, full evidence chains.",
                8.5,
                SLATE,
                False,
                None,
                PP_ALIGN.LEFT,
            ),
        ],
    )
    folio(s, 7)
    set_notes(
        s,
        """4:20–4:35 — “Boring technology buys you a demo that never apologises.”
Cost math if pressed: Supabase free tier (2 projects free), Vercel hobby — genuinely ₹0 at pilot scale; 60-day expiry forces honest reseed anyway.
Q&A: (1) “What’s the biggest risk?” → honesty: if venue Wi-Fi dies, we show the labeled replay + recorded video; judges score substance not spectacle — say so out loud. (2) “Who maintains this?” → pilot = you, the officer, 2 hours/week; alerts are email-grade; nothing grows unbounded. (3) “Hidden confession?” → the seeded live repo (github.com/rahuljadhav/placement-lab) does not exist; verify says so and replays labeled — that’s the feature.""",
    )


# ============================================================ S8 — OUTCOMES


def slide8(prs):
    s = blank(prs)
    kicker(s, "EXPECTED OUTCOMES — the number that matters", right="IMPACT")
    rule(s, 0.85)
    tb(
        s,
        0.6,
        1.02,
        12.13,
        0.75,
        [
            ("+8–15 pp", 66, RED, True, None, PP_ALIGN.LEFT),
            (
                "placement-rate hypothesis for a pilot batch — measured, not vibes.",
                13,
                INK,
                True,
                1,
                PP_ALIGN.LEFT,
            ),
        ],
    )
    # chart panel left
    tb(
        s,
        0.6,
        2.62,
        6.8,
        0.25,
        [
            (
                "WHERE THE COHORT IS HURTING — measured from mock drives",
                8,
                SLATE,
                True,
                None,
                PP_ALIGN.LEFT,
            )
        ],
    )
    p = ASSETS / "cohort-weakness.png"
    pic(
        s,
        p,
        0.6,
        2.95,
        7.0,
        3.0,
        "Horizontal bar chart of seeded cohort weakness: Docker 90 percent, SQL 60 percent, Git 20 percent",
    )
    tb(
        s,
        0.6,
        5.98,
        6.9,
        0.3,
        [
            (
                "n=7 demo cohort (measured). Will be replaced by batch-1 pilot numbers — not presented as findings.",
                7,
                SLATE,
                False,
                None,
                PP_ALIGN.LEFT,
            )
        ],
    )
    # right column KPI outcomes
    x = 8.35
    outs = [
        (
            "SQL competency",
            "Workshop gates the Nimbus sweep re-run — pass rate tracked before drive",
        ),
        (
            "NAAC/NIRF evidence",
            "One click: outcomes CSV export — same rows as the heatmap; nothing compiled by hand",
        ),
        (
            "Recruiter minutes",
            "Verified-only search; “why this match” reason codes; manual shortlisting collapses",
        ),
        (
            "Growth loop",
            "Weakness → path → artifact → retest — measured pre/post, written to audit",
        ),
    ]
    tb(s, x, 2.62, 4.4, 0.22, [("WHAT MOVES", 8, SLATE, True, None, PP_ALIGN.LEFT)])
    y = 2.95
    for head, body in outs:
        tb(s, x, y, 4.4, 0.24, [(head, 10, INK, True, None, PP_ALIGN.LEFT)])
        tb(
            s,
            x,
            y + 0.2,
            4.4,
            0.62,
            [(body, 8.5, "2E3138", False, None, PP_ALIGN.LEFT)],
        )
        y += 0.85
    footnote(
        s,
        "Hypothesis range from cohort deltas in seeded data; pilot will publish real pre/post numbers. No efficacy claim beyond what the batch proves.",
    )
    folio(s, 8)
    set_notes(
        s,
        """4:35–4:50 — “Judges, here's the honest arithmetic — we never claim beyond our data.”
If asked where +8–15pp came from: it's a stated hypothesis from the seeded cohort's measured recovery (SQL 60% → path completion → re-gate), to be replaced by pilot measurement; say this plainly, don't oversell.
Close with the mechanism, not hope: weakness detected → targeted workshop → eligibility re-sweep → drive outcomes measured → next cohort starts ahead.
Q&A: (1) “How will you know it worked?” → pre/post mock-drive SQL scores + placement % vs prior batch CI + recruiter acceptance rate; all three exported from NAAC CSV. (2) “What if it doesn't?” → then we learn it cheaply in one batch and the audit trail shows where the mechanism failed — either way, evidence compounds. (3) “Who pays?” → pilot free (this hack); sustainability = small annual licence per college or grant-backed; not a free-tier sermon.""",
    )


# ============================================================ S9 — ROADMAP


def slide9(prs):
    s = blank(prs)
    kicker(s, "ROADMAP — 90 DAYS TO A PILOT", right="NEXT")
    rule(s, 0.85)
    tb(
        s,
        0.6,
        1.02,
        12.13,
        0.6,
        [
            ("One college pilots it.", 44, INK, True, None, PP_ALIGN.LEFT),
            (
                "The network scales it — on evidence, not on hope.",
                13,
                SLATE,
                False,
                2,
                PP_ALIGN.LEFT,
            ),
        ],
    )
    # 5-node timeline
    nodes = [
        (
            "JAN 2027",
            "ROUND 1",
            "This presentation. Shortlist → offline hack, 23–24 Jan",
        ),
        (
            "FEB 2027",
            "PILOT",
            "2 sections · one drive · pre/post mock-drive SQL — real numbers out",
        ),
        (
            "APR 2027",
            "SCALE",
            "Multi-branch cohorts · recruiter onboarding · multi-tenant flips on",
        ),
        (
            "JUN 2027",
            "CREDENTIAL",
            "Open Badges 3.0 / W3C VC for verified top performers — portable",
        ),
        (
            "AUG 2027",
            "UNIVERSITY",
            "Per PS: single college → university → multi-college, tenant by design",
        ),
    ]
    y = 2.6
    x = 0.6
    step_w = 2.15
    gap_w = 0.33
    rule(s, y + 0.31, x=0.6, w=12.13, width=1.5, color=INK)
    for i, (date, tag, body) in enumerate(nodes):
        cx = x + i * (step_w + gap_w) + step_w / 2
        dot = s.shapes.add_shape(
            MSO_SHAPE.OVAL,
            Inches(cx - 0.10),
            Inches(y + 0.20),
            Inches(0.2),
            Inches(0.2),
        )
        dot.shadow.inherit = False
        dot.fill.solid()
        dot.fill.fore_color.rgb = hex_(RED if i == 1 else INK)
        dot.line.fill.background()
        tb(
            s,
            x,
            y + 0.62,
            step_w,
            0.22,
            [(date, 9, RED if i == 1 else INK, True, None, PP_ALIGN.LEFT)],
        )
        tb(s, x, y + 0.86, step_w, 0.25, [(tag, 12, INK, True, None, PP_ALIGN.LEFT)])
        tb(
            s,
            x,
            y + 1.13,
            step_w,
            1.35,
            [(body, 7.6, "2E3138", False, None, PP_ALIGN.LEFT)],
        )
    tb(
        s,
        0.6,
        6.35,
        12.13,
        0.28,
        [
            (
                "Why Open Badges: credentials that outlive the server — verifiable by any standards-aware employer (1EdTech, 2023).",
                9,
                SLATE,
                False,
                None,
                PP_ALIGN.LEFT,
            ),
        ],
    )
    folio(s, 9)
    set_notes(
        s,
        """4:50–4:55 — thirty seconds: “Pilot → prove → scale. We don't ask for the university — we ask for one batch and 4 weeks.”
Anchor every date in events that already exist (Round 1, offline hack) or measurable checkpoints (sections, drives, exports) — nothing vague.
Q&A: (1) “Budget for year one?” → ₹0 at pilot scale; year-one sustainable ask is one laptop + ₹0 cloud + officer time. (2) “What if VPPCOE isn't interested?” → the artifact outlives the pitch: repo open, exports standard, credentials portable — any college can fork it. (3) “What does Round 1 buy you?” → the pilot window and the same-build demo.""",
    )


# ============================================================ S10 — THE ASK


def slide10(prs):
    s = blank(prs)
    kicker(s, "THE ASK — three things", right="CLOSE")
    rule(s, 0.85)
    tb(
        s,
        0.6,
        1.15,
        12.13,
        1.3,
        [
            ("Shortlist us.", 88, INK, True, None, PP_ALIGN.LEFT),
        ],
    )
    asks = [
        ("1", "Select Pravega for the offline build — 23–24 January 2027."),
        ("2", "Judges click the URL — live, sealed demo data, every claim checkable."),
        (
            "3",
            "We return a measured pilot by March: pre/post SQL scores + placement delta.",
        ),
    ]
    y = 3.35
    for n, text in asks:
        tb(s, 0.6, y, 0.7, 0.6, [(n, 40, RED, True, None, PP_ALIGN.LEFT)])
        tb(s, 1.4, y + 0.06, 11.2, 0.72, [(text, 15.5, INK, True, None, PP_ALIGN.LEFT)])
        y += 0.72
    rule(s, 5.55, width=12.13)
    tb(
        s,
        0.6,
        5.75,
        12.13,
        0.9,
        [
            ("One case.", 30, INK, True, None, PP_ALIGN.LEFT),
            ("One trail. Full visibility.", 30, INK, True, 2, PP_ALIGN.LEFT),
            (
                "Siddhesh · VPPCOE T&P · Pravega · repo on request",
                9,
                SLATE,
                False,
                10,
                PP_ALIGN.LEFT,
            ),
        ],
    )
    folio(s, 10)
    set_notes(
        s,
        """4:55–5:00 — land soft, land specific:
“You can verify everything you've seen — including us. Ask the hardest question you have.”
COMMITMENTS if selected (say aloud): (1) working offline build on your network, (2) DPDP-clean, (3) pilot measurement by March.
Do NOT add new promises under pressure; scope is the product.
Q&A weapons: (1) “Why should we pick you?” → “Because our demo is honest enough to audit live — try to break it.” (2) “What will you NOT do?” → “No fake AI, no fake numbers, no fake users. Ever.” (3) “What's the one thing you wish you knew?” → “That placements needed trust before they needed tools — we built the trust layer first.”""",
    )


def main():
    prs = new_pres()
    slide1(prs)
    slide2(prs)
    slide3(prs)
    slide4(prs)
    slide5(prs)
    slide6(prs)
    slide7(prs)
    slide8(prs)
    slide9(prs)
    slide10(prs)
    out = ROOT / "pravega-round1.pptx"
    prs.core_properties.title = "Pravega — Quasar 5.0 Round 1"
    prs.core_properties.author = "Siddhesh"
    prs.core_properties.comments = (
        "Round-1 deck for Quasar 5.0 (PS: EdTech — Agentic Placement Intelligence)."
    )
    prs.save(out)
    print("saved", out)


if __name__ == "__main__":
    main()
