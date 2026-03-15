import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col justify-center text-center flex-1">
      <h1 className="text-4xl font-bold mb-4">Matos UI</h1>
      <p className="text-lg text-muted-foreground mb-6">
        Componentes estilizados para shadcn/ui
      </p>
      <p>
        <Link href="/docs" className="font-medium text-xl underline">
          /docs
        </Link>
      </p>
    </div>
  );
}
