import Image from "next/image";

export default function PoweredBy() {
  return (
    <div className="w-full flex justify-center px-4 mt-20 md:mt-28 lg:mt-32 pt-8 sm:pt-10 md:pt-12 lg:pt-16">
      <div className="flex flex-col items-center w-full max-w-6xl">
        <h3
          className="text-center text-[#64748B]
                     text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-[50px]
                     leading-tight md:leading-[56px] lg:leading-[64px] xl:leading-[80px]
                     mb-6 md:mb-8"
        >
          Powered by
        </h3>
        <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 md:gap-12 lg:gap-16">
          <Image
            src="/jup_x2.png"
            alt="Jupiter"
            width={176}
            height={59}
            className="h-8 sm:h-10 md:h-12 lg:h-14 w-auto"
          />
          <Image
            src="/drift_png.png"
            alt="Drift"
            width={176}
            height={59}
            className="h-8 sm:h-10 md:h-12 lg:h-14 w-auto"
          />
          <Image
            src="/pyth.svg"
            alt="Pyth"
            width={156}
            height={54}
            className="h-8 sm:h-10 md:h-12 lg:h-14 w-auto"
          />
        </div>
      </div>
    </div>
  );
}
