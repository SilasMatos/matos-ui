type ComponentSkillDocOptions = {
  title: string;
  description?: string;
  slug?: string[];
  raw: string;
  url: string;
};

function toSkillName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function stripFrontmatter(value: string) {
  return value.replace(/^---[\s\S]*?---\s*/, "").trim();
}

export function getComponentSkillDoc({
  title,
  description,
  slug,
  raw,
  url,
}: ComponentSkillDocOptions) {
  if (slug?.[0] !== "components" || !slug[1]) {
    return null;
  }

  const componentName = slug[1];
  const skillName = `matos-ui-${toSkillName(componentName)}`;
  const skillDescription =
    description ??
    `Use when installing, configuring, or explaining the Matos UI ${title} component.`;
  const body = stripFrontmatter(raw);

  return `---
name: ${skillName}
description: ${skillDescription}
---

# ${title}

Use this skill when you need to install, configure, customize, or explain the Matos UI ${title} component.

Source documentation: ${url}

${body}
`;
}
