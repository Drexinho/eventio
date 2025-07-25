import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Vítejte v EventPlanner</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Soukromý plánovač událostí pro více skupin
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <a href="/create">Vytvořit novou událost</a>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href="/join">Připojit se k události</a>
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>🎯 Jednoduché plánování</CardTitle>
            <CardDescription>
              Vytvořte událost během několika kliknutí a sdílejte ji s přáteli
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Zadejte základní informace o události a získejte unikátní odkaz nebo PIN kód pro sdílení.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>👥 Spolupráce v reálném čase</CardTitle>
            <CardDescription>
              Všichni účastníci mohou přidávat a upravovat informace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Přidávejte účastníky, plánujte dopravu a spravujte inventář společně.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🔒 Soukromé a bezpečné</CardTitle>
            <CardDescription>
              Každá událost je přístupná pouze přes unikátní odkaz nebo PIN
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Vaše události zůstávají soukromé a přístupné pouze těm, kterým je sdílíte.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
