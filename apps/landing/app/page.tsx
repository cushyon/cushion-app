import Link from "next/link";
import Image from "next/image";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Gradient background effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px] rounded-full bg-purple-700/20 blur-[120px] transform -translate-y-1/2" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-blue-600/20 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12">
        <div className="flex items-center gap-2">
          <Image
            src="/logo_white.svg"
            width={280}
            height={80}
            priority
            alt="Cushion logo"
          />
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="#resources"
            className="text-gray-400 hover:text-white transition-colors"
          >
            Resources
          </Link>
          <Link href="https://app.cushion.trade/vaults/FTKm3WgS8K5AkDKL9UZnmD12JdhFnvxvNN1mF6adGXH9">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6">
              Launch app
            </Button>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 px-6 md:px-12 pt-24 md:pt-32 pb-20 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Quantitative strategies for performance
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-xl">
              Cushion brings capital-protected strategies to DeFi, offering
              high-return solutions with advanced risk management
            </p>

            <div className="mt-15">
              <Card className="w-full max-w-sm bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border-0 p-6 rounded-xl shadow-xl">
                <div className="space-y-4">
                  <div className="flex flex-col items-start gap-2">
                    <span className="text-xl text-gray-200">
                      Simple, optimized, non-custodial
                    </span>
                    <span className="text-xl text-gray-200">vaults</span>
                  </div>
                  <div className="pt-2">
                    <Link href="https://app.cushion.trade/vaults/FTKm3WgS8K5AkDKL9UZnmD12JdhFnvxvNN1mF6adGXH9">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 w-full sm:w-auto">
                        Earn
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <div className="hidden md:block">
            {/* This space is intentionally left empty to match the layout in the image */}
          </div>
        </div>
      </main>
    </div>
  );
}
