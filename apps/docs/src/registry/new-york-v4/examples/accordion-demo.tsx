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
        <AccordionTrigger value="item-1">O que é o Matos UI?</AccordionTrigger>
        <AccordionContent value="item-1">
          Uma biblioteca de componentes estilizados construída sobre shadcn/ui,
          com variantes e animações prontas para uso em produção.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger value="item-2">Como instalar?</AccordionTrigger>
        <AccordionContent value="item-2">
          Use o CLI do shadcn: npx shadcn@latest add
          https://matos-ui.vercel.app/r/accordion.json
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger value="item-3">É gratuito?</AccordionTrigger>
        <AccordionContent value="item-3">
          Sim. Os componentes são open source e podem ser copiados ou instalados
          no seu projeto.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
