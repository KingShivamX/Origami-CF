import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center px-4 sm:px-6 lg:px-8 py-[40px] md:py-[80px] animate-page-entrance">
      <div className="max-w-md w-full flex flex-col items-center gap-6">
        <div className="text-[120px] leading-none font-black text-accentPrimary tracking-tighter">
          404
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-[32px] md:text-[40px] font-extrabold leading-[1.1] tracking-tight text-foreground">
            Page Not Found
          </h1>
          <p className="text-[16px] md:text-[18px] text-textSecondary font-medium">
            Sorry, we couldn&apos;t find the page you were looking for.
          </p>
        </div>

        <div className="mt-4">
          <Button asChild size="lg" className="px-8 h-14 rounded-xl font-bold bg-accentPrimary hover:bg-accentHover text-white transition-colors">
            <Link href="/" className="inline-flex items-center">
              Go back home
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
