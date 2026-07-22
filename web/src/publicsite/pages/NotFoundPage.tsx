import { Link } from "react-router-dom";
import { AlertOctagon, Home } from "lucide-react";
import { Container, Button } from "../components/common/UI";

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-20 px-4">
      <Container className="text-center max-w-md space-y-6">
        <div className="p-4 bg-red-50 text-[#D92D20] rounded-full w-fit mx-auto border border-red-100 shadow-inner">
          <AlertOctagon className="w-14 h-14" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-[#172033] tracking-tight">404 - Page Not Found</h1>
          <p className="text-sm text-[#667085] leading-relaxed">
            The page you are looking for does not exist on the CARTA School public website, or has been relocated by administration.
          </p>
        </div>
        <div>
          <Link to="/">
            <Button variant="primary" icon={<Home className="w-4 h-4" />}>
              Go Back to Homepage
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}
