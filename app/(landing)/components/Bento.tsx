import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function BentoGrid() {
  return (
    <div className="bento">      
      {/* Configuration du Grid : 4 colonnes sur desktop, 1 sur mobile */}
      <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-full ">
        
        {/* Tuile 1 : La Grande (Prend 2 colonnes et 2 lignes) */}
        <Card className="md:col-span-2 md:row-span-2 bg-slate-950 text-white flex flex-col justify-end overflow-hidden border-none ring-1 ring-slate-800 waveCard">
          <CardHeader>
            <CardTitle className="text-2xl">Ondes</CardTitle>
            <CardDescription className="text-slate-400">Visualiser des ondes en 3D</CardDescription>
          </CardHeader>
        </Card>

        {/* Tuile 2 : Largeur moyenne */}
        <Card className="md:col-span-2 bg-white">
          <CardHeader>
            <CardTitle>Visualisation Scientifique</CardTitle>
            <CardDescription>Observer des phénomènes quantiques en action</CardDescription>
          </CardHeader>
          <CardContent>
            <img src="/onde.png" alt="Visualisation d'ondes"/>
          </CardContent>
        </Card>

        {/* Tuile 3 : Petite carrée */}
        <Card className="bg-orange-500 text-white border-none">
          <CardHeader>
            <CardTitle className="text-lg">Comprendre</CardTitle>
          </CardHeader>
        </Card>

        {/* Tuile 4 : Petite carrée */}
        <Card className="bg-slate-100">
          <CardHeader>
            <CardTitle className="text-lg">Apprendre</CardTitle>
          </CardHeader>
         
        </Card>

      </div>
    </div>
  )
}