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
          <Link href="https://app.cushion.trade/vaults">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 bg-[linear-gradient(90deg,#091BCD_0%,#123FFC_35%,#0B3FE8_64%,#4571F4_100%)]">
              Launch app
            </Button>
          </Link>
        </div>
      </header>

      <main>
        <section
          className="relative isolate flex items-center min-h-[calc(100vh-96px)]
                          overflow-visible px-6 md:px-12"
        >
          <Image
            src="/img.png"
            alt="Decorative gradient"
            fill
            priority
            className="absolute inset-0 -z-10 object-cover blur-2xl pointer-events-none"
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
              <Link href="https://app.cushion.trade/vaults">
                <Button className="rounded-full px-8 py-3 text-sm w-full sm:w-auto bg-[linear-gradient(90deg,#091BCD_0%,#123FFC_35%,#0B3FE8_64%,#4571F4_100%)]">
                  Earn
                </Button>
              </Link>
            </div>
            {/* right column intentionally left empty to match the mock-up */}
          </div>
        </section>
        {/* </div> */}
        {/* <section className="flex h-[140px] justify-center items-center gap-2.5 flex-shrink-0 w-full mt-32">
          <div className="flex-1 text-center">
            <h2
              className="text-7xl font-semibold leading-[60px] opacity-80"
              style={{
                background:
                  "linear-gradient(211deg, rgba(124, 187, 255, 0.90) 67.58%, rgba(23, 81, 239, 0.02) 175.62%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Security and performance
            </h2>
          </div>
        </section> */}
        <section className="px-6 md:px-12 py-24 max-w-7xl mx-auto">
          <PoweredBy />
        </section>
      </main>
    </div>
  );
}
