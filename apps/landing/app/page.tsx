import Link from "next/link";
import Image from "next/image";
import { Button } from "../components/ui/button";
import PoweredBy from "../components/powered-by";

export default function Home() {
  return (
    <div className="w-screen bg-black">
      <header className="flex items-center justify-between px-6 py-6 md:px-12">
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
          <Link href="https://app.cushion.trade/vaults/FTKm3WgS8K5AkDKL9UZnmD12JdhFnvxvNN1mF6adGXH9">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 bg-[linear-gradient(90deg,#091BCD_0%,#123FFC_35%,#0B3FE8_64%,#4571F4_100%)]">
              Launch app
            </Button>
          </Link>
        </div>
      </header>

      <main>
        <section
          className="relative isolate flex items-center min-h-[calc(100vh-96px)]
             overflow-visible px-6 md:px-12
             after:absolute after:inset-x-0 after:bottom-0 after:h-48
             after:bg-gradient-to-b after:from-transparent after:to-black
             after:pointer-events-none"
        >
          <Image
            src="/img.png"
            alt="Decorative gradient"
            fill
            priority
            className="absolute inset-0 -z-10 object-cover pointer-events-none"
          />
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Quantitative strategies for performance
              </h1>
              <p className="text-gray-400 text-lg md:text-xl max-w-xl">
                Cushion brings capital-protected strategies to DeFi, offering
                high-return solutions with advanced risk management
              </p>
              <Link href="https://app.cushion.trade/vaults/FTKm3WgS8K5AkDKL9UZnmD12JdhFnvxvNN1mF6adGXH9">
                <Button className="rounded-full px-8 py-3 text-sm w-full sm:w-auto bg-[linear-gradient(90deg,#091BCD_0%,#123FFC_35%,#0B3FE8_64%,#4571F4_100%)]">
                  Earn
                </Button>
              </Link>
            </div>
            {/* right column intentionally left empty to match the mock-up */}
          </div>
        </section>
        {/* </div> */}
        <section
          className="w-full flex items-center justify-center
                     px-4 py-8 sm:py-10 md:py-12 lg:py-16"
        >
          <h2
            className="flex-1 text-center font-pretendard font-semibold
               text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-[120px]
               leading-[1.1] opacity-90
               bg-gradient-to-b
               from-[#7CBBFF] to-[#1751EF33]
               bg-clip-text text-transparent"
          >
            Security and performance
          </h2>
        </section>
        <section className="w-full flex justify-center px-4 mt-16 md:mt-24 lg:mt-32">
          <div className="flex flex-col items-center w-full max-w-xl md:max-w-3xl lg:max-w-[1472px] gap-[35px]">
            <h2
              className="text-center font-pretendard font-bold text-[#F1F5F9]
                 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[48px]
                 leading-tight sm:leading-[48px] md:leading-[60px] lg:leading-[68px] xl:leading-[76px]"
            >
              Maximize&nbsp;Performance,
              <br />
              Safeguard&nbsp;Your&nbsp;Assets
            </h2>

            <p
              className="text-center font-pretendard text-slate-400
                 text-sm sm:text-base md:text-lg lg:text-xl
                 leading-relaxed sm:leading-7 md:leading-8
                 max-w-lg md:max-w-xl lg:max-w-2xl"
            >
              Benefit from strategies based on quantitative models,
              <br />
              for performance and capital&nbsp;protection,
              invest&nbsp;smarter&nbsp;and&nbsp;simpler.
            </p>
          </div>
        </section>
        <section className="px-6 md:px-12 py-24 max-w-7xl mx-auto">
          <PoweredBy />
        </section>
      </main>
    </div>
  );
}
