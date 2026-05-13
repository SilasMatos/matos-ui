import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/new-york-v4/ui/accordion";

export default function AccordionDemo() {
  return (
    <Accordion>
      <AccordionItem value="item-1">
        <AccordionTrigger value="item-1">What is Matos UI?</AccordionTrigger>
        <AccordionContent value="item-1">
          A styled component library built on top of shadcn/ui, with variants
          and animations ready for production.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger value="item-2">How do I install it?</AccordionTrigger>
        <AccordionContent value="item-2">
          Use the shadcn CLI: npx shadcn@latest add
          https://matos-ui.com/r/accordion.json
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger value="item-3">Is it free?</AccordionTrigger>
        <AccordionContent value="item-3">
          Yes. The components are open source and can be copied or installed in
          your project.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
