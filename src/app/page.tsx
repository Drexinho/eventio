import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-black to-slate-900"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mb-8 shadow-2xl">
              <span className="text-4xl">⚡</span>
            </div>
            <h1 className="text-7xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              EventPlanner
            </h1>
            <p className="text-2xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Futuristický plánovač událostí pro <span className="text-cyan-400 font-semibold">moderní skupiny</span>
            </p>
            <div className="flex gap-6 justify-center mb-12">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-10 py-6 text-lg font-semibold shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105 border-0"
                asChild
              >
                <a href="/create">
                  <span className="mr-3">🚀</span>
                  Vytvořit událost
                </a>
              </Button>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white px-10 py-6 text-lg font-semibold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 border-0"
                asChild
              >
                <a href="/join">
                  <span className="mr-3">🔗</span>
                  Připojit se
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-4">
            Proč EventPlanner?
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Kombinujeme futuristický design s pokročilými funkcemi pro dokonalé plánování událostí
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl">⚡</span>
              </div>
              <CardTitle className="text-2xl font-bold text-white">
                Rychlé vytvoření
              </CardTitle>
              <CardDescription className="text-slate-400">
                Událost vytvoříte během několika kliknutí
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-center leading-relaxed">
                Zadejte základní informace a získejte unikátní odkaz pro sdílení s přáteli a rodinou.
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl">⚡</span>
              </div>
              <CardTitle className="text-2xl font-bold text-white">
                Spolupráce v reálném čase
              </CardTitle>
              <CardDescription className="text-slate-400">
                Všichni mohou přidávat a upravovat
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-center leading-relaxed">
                Přidávejte účastníky, plánujte dopravu a spravujte inventář společně v reálném čase.
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl">🔒</span>
              </div>
              <CardTitle className="text-2xl font-bold text-white">
                Soukromé a bezpečné
              </CardTitle>
              <CardDescription className="text-slate-400">
                Přístup pouze přes unikátní odkaz
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-center leading-relaxed">
                Každá událost je přístupná pouze těm, kterým ji sdílíte. Vaše data zůstávají v bezpečí.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-3xl p-16 text-center">
          <h2 className="text-5xl font-bold text-white mb-4">
            Začněte plánovat ještě dnes
          </h2>
          <p className="text-xl mb-8 text-slate-300">
            Vytvořte svou první událost a přesvědčte se sami
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-12 py-6 text-xl font-semibold shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105 border-0"
            asChild
          >
            <a href="/create">
              <span className="mr-3">🚀</span>
              Vytvořit událost
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
