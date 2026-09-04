"use client";

import {
  ExpandableList,
  ExpandableListItem,
} from "@/registry/new-york-v4/ui/expandable-list";

const items = [
  {
    value: "billing",
    title: "How does billing work?",
    body: "You're billed monthly based on active seats. Adding or removing a teammate prorates the next invoice automatically — no manual adjustment needed.",
  },
  {
    value: "export",
    title: "Can I export my data?",
    body: "Yes. Every workspace can export a full JSON snapshot from Settings → Data, and it includes everything: components, blocks, and customization presets.",
  },
  {
    value: "sso",
    title: "Do you support SSO?",
    body: "SSO via SAML and OIDC is available on the Team plan. Once configured, members can also enforce it for the whole workspace from the security tab.",
  },
  {
    value: "limits",
    title: "What happens if I hit a usage limit?",
    body: "Nothing breaks. You'll see a warning banner and an email a few days ahead — existing projects keep working while you decide whether to upgrade.",
  },
];

export default function ExpandableListDemo() {
  return (
    <div className="w-full max-w-md">
      <ExpandableList defaultOpenValues={["billing"]}>
        {items.map((item) => (
          <ExpandableListItem
            key={item.value}
            value={item.value}
            title={item.title}
          >
            {item.body}
          </ExpandableListItem>
        ))}
      </ExpandableList>
    </div>
  );
}
