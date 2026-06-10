import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <div className="text-6xl">🍽️</div>
      <h1 className="mt-4 font-serif text-3xl font-bold text-saffron-700">
        Page not found
      </h1>
      <p className="mt-2 text-forest-600">
        Looks like this dish isn't on the menu.
      </p>
      <Link to="/" className="btn-primary mt-6">
        Back to Home
      </Link>
    </div>
  );
}
