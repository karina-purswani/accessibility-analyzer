import express from "express";

const router = express.Router();

router.post("/", (req, res) => {
  const { ruleId, description, html } = req.body;

  if (!ruleId || !description) {
    return res.status(400).json({
      error: "Missing ruleId or description",
    });
  }

  let fix = "";

  switch (ruleId) {
    case "image-alt":
      fix = `
Why this is an accessibility issue:
Images without alt text cannot be read by screen readers.

Suggested fix:
<img src="logo.png" alt="Descriptive text explaining the image">
`;
      break;

    case "color-contrast":
      fix = `
Why this is an accessibility issue:
Low contrast text is difficult to read for users with visual impairments.

Suggested fix:
Increase contrast between text and background.

Example:
color: #000000;
background-color: #FFFFFF;
`;
      break;

    case "landmark-one-main":
      fix = `
Why this is an accessibility issue:
Pages should contain exactly one <main> landmark for screen readers.

Suggested fix:
<main>
  <!-- Main page content -->
</main>
`;
      break;

    case "region":
      fix = `
Why this is an accessibility issue:
Content should be contained within landmark regions.

Suggested fix:
Wrap content inside semantic landmarks like <main>, <nav>, or <section>.
`;
      break;

    case "list":
      fix = `
Why this is an accessibility issue:
Lists must use semantic HTML elements.

Suggested fix:
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>
`;
      break;

    case "scrollable-region-focusable":
      fix = `
Why this is an accessibility issue:
Scrollable regions must be focusable for keyboard users.

Suggested fix:
<div tabindex="0" style="overflow-y: auto;">
  <!-- scrollable content -->
</div>
`;
      break;

    case "aria-roles":
      fix = `
Why this is an accessibility issue:
ARIA roles must match the element's purpose.

Suggested fix:
Use native HTML elements whenever possible instead of ARIA roles.
`;
      break;

    default:
      fix = `
Why this is an accessibility issue:
This rule requires manual review and context-specific changes.

Suggested fix:
Refer to WCAG 2.1 guidelines and Axe documentation for this rule.
`;
  }

  return res.json({ fix });
});

export default router;
