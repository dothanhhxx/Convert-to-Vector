# Vector Studio - Project-Specific Design Rules

## Core Design Philosophy
**"Prefer global UI consistency over local optimizations."**
Vector Studio is designed as a professional desktop-grade vector graphics conversion workstation (akin to Adobe Illustrator, Figma, Vectorizer.ai). The interface prioritizes predictable interactions, unified component systems, visual clarity, and high responsiveness.

---

## 1. Component Library Discipline
- **Primary Library:** Ant Design (`antd` v5).
- **Adoption Principle:** Use the components of the library as much as possible (Buttons, Sliders, Segmented controls, Select, Card, Modal, Tooltip, Badge, Progress, Spin, Dropdown, Space, Alert, Empty).
- **Zero Hacks:** Never adapt or fight library components with brittle CSS overrides. Prefer slight imperfections with library components over fragile custom components.

---

## 2. Typography Rules
To maintain strict global visual hierarchy, exactly **2 font weights** are permitted across the entire interface:
1. **Regular (`400`)**: Body text, descriptions, slider labels, helper hints, tooltips, table data.
2. **SemiBold (`600`)**: Headings, section titles, active states, button labels, key metrics.

**Font Family:**
- Modern clean sans-serif: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`.
- Monospace figures for coordinates, percentages, and path stats: `'JetBrains Mono', 'Fira Code', Menlo, monospace`.

---

## 3. Strict 2 Text Colors System
To eliminate visual clutter and ensure effortless readability in both light and dark studio environments, exactly **2 text colors** are used:
1. **Primary Text (`#F1F5F9` in Dark Mode / `#0F172A` in Light Mode)**:
   - High contrast. Used for main headings, labels, active selections, primary stats, and code.
2. **Secondary Muted Text (`#94A3B8` in Dark Mode / `#64748B` in Light Mode)**:
   - Medium contrast. Used for secondary descriptions, inactive tabs, unit markers, timestamps, and placeholders.

---

## 4. Iconography & Weights
- Icons come exclusively from `@ant-design/icons` for consistent stroke weights and geometry.
- Icon weights adapt to the text adjacent to them:
  - Inside primary buttons and active headers: standard weight matching SemiBold text (`600`).
  - Inside secondary toolbars, helper badges, and input prefixes: outlined weight matching Regular text (`400`).
- No emojis used as structural or action icons.

---

## 5. Color Palette & Dark Studio Aesthetic
- **Canvas / Studio Background:** `#0B0F17` (Deep obsidian dark studio).
- **Sidebar & Surface Panels:** `#151B26` (Professional slate slate-card).
- **Card & Control Surface:** `#1C2433`.
- **Borders & Dividers:** `#283347`.
- **Brand Accent / Primary Active:** `#3B82F6` (Electric Blue, consistent across all active highlights, sliders, focus rings, and primary action CTAs).
- **Success Accent:** `#10B981` (Emerald, for vectorization success and verified paths).
- **Warning / Alert Accent:** `#F59E0B`.

---

## 6. Interaction & Layout Rules
- **Sidebar Width:** Fixed 360px on desktop for predictable, consistent parameter tuning.
- **Center Canvas:** Flexible viewport with pan & zoom, split comparison slider, side-by-side mode, outline inspector, and background switcher.
- **Header:** 56px fixed height with global actions (New, Samples, Illustrator Guide, Theme).
- **Export Toolbar:** Docked footer bar with instant format options (SVG, PDF, EPS, AI, ZIP).
- **Feedback & States:** Clear loading spinners, progress indicators, empty states, and dismissible alerts with actionable guidance.
