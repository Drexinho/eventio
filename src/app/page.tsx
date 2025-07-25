import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6 shadow-lg">
              <span className="text-3xl">🎉</span>
            </div>
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              EventPlanner
            </h1>
            <p className="text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Moderní plánovač událostí pro <span className="font-semibold text-blue-600 dark:text-blue-400">skupiny</span> a <span className="font-semibold text-purple-600 dark:text-purple-400">komunity</span>
            </p>
            <div className="flex gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                asChild
              >
                <a href="/create">
                  <span className="mr-2">✨</span>
                  Vytvořit událost
                </a>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-8 py-4 text-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 transform hover:scale-105"
                asChild
              >
                <a href="/join">
                  <span className="mr-2">🔗</span>
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
          <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-200 mb-4">
            Proč EventPlanner?
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Kombinujeme jednoduchost s pokročilými funkcemi pro dokonalé plánování událostí
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🎯</span>
              </div>
              <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                Rychlé vytvoření
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Událost vytvoříte během několika kliknutí
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400 text-center leading-relaxed">
                Zadejte základní informace a získejte unikátní odkaz pro sdílení s přáteli a rodinou.
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">👥</span>
              </div>
              <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                Spolupráce v reálném čase
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Všichni mohou přidávat a upravovat
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400 text-center leading-relaxed">
                Přidávejte účastníky, plánujte dopravu a spravujte inventář společně v reálném čase.
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🔒</span>
              </div>
              <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                Soukromé a bezpečné
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Přístup pouze přes unikátní odkaz
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400 text-center leading-relaxed">
                Každá událost je přístupná pouze těm, kterým ji sdílíte. Vaše data zůstávají v bezpečí.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Začněte plánovat ještě dnes
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Vytvořte svou první událost a přesvědčte se sami
          </p>
          <Button 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-slate-100 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            asChild
          >
            <a href="/create">
              <span className="mr-2">🚀</span>
              Vytvořit událost
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
