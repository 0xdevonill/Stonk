import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
import { Lockup } from '../components/brand/Logo';

export function NotFoundPage() {
  usePageTitle('Not found');
  return (
    <div className="full-error">
      <Lockup variant="stacked" markSize={48} />
      <h1 className="heading-lg">This page isn&apos;t on the book.</h1>
      <p className="body-md muted">The route does not match a terminal screen.</p>
      <Link to="/" className="btn btn-primary btn-md">
        Back to the desk
      </Link>
    </div>
  );
}
