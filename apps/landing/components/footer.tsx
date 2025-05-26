import Link from "next/link";
import { SiX } from "react-icons/si";
import { Logo } from "./ui/logo";

export function Footer() {
  return (
    <footer className="w-full bg-[#123FFC] text-white py-12 px-4 md:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-6">
            <div className="flex items-center mb-6">
              <Logo className="h-10 w-auto" size={280} />
            </div>

            <div className="mt-12">
              <p className="text-lg mb-4">Join our community</p>
              <Link
                href="https://x.com/cushiondottrade"
                className="inline-block"
              >
                <SiX className="w-6 h-6" />
                <span className="sr-only">Y</span>
              </Link>
            </div>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-xl font-medium mb-6">Resources</h3>
            <ul className="space-y-4">
              <li>
                <Link href="#" className="hover:underline">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Github
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Media Kit
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-xl font-medium mb-6">Company</h3>
            <ul className="space-y-4">
              <li>
                <Link href="#" className="hover:underline">
                  Contact us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Term of use
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Privacy policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
