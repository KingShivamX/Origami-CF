import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-8xl font-bold text-primary animate-bounce">
          404
        </div>
        <h1 className="mt-4 text-4xl font-extrabold text-foreground tracking-tight sm:text-5xl">
          Page Not Found
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Sorry, we couldn't find the page you were looking for.
        </p>
        <div className="mt-8">
          <Button asChild size="lg">
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
