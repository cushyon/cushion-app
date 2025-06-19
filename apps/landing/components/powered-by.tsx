import Image from "next/image";

export default function PoweredBy() {
  return (
    <div className="mt-32 pt-16">
      <div className="text-center">
        <h3 className="text-[#64748B] text-center text-[50px] leading-[80px] mb-8">
          Powered by
        </h3>
        <div className="flex items-center justify-center gap-12 md:gap-16">
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
