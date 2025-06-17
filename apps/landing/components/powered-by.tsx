import Image from "next/image";

export default function PoweredBy() {
  return (
    <div className="mt-32 pt-16">
      <div className="text-center">
        <h3 className="text-gray-500 text-3xl mb-8">Powered by</h3>
        <div className="flex items-center justify-center gap-12 md:gap-16">
          <Image src="/Drift.svg" alt="Drift" width={176} height={59} />
          <Image src="/pyth.svg" alt="Pyth" width={156} height={54} />
        </div>
      </div>
    </div>
  );
}
