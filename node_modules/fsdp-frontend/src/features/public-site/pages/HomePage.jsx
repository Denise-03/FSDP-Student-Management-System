import { Link } from 'react-router-dom';
import { ArrowUpRight, MapPin, ShieldCheck, Activity } from 'lucide-react';
import { useApp } from '../../../app/providers.jsx';
import { Card, Resource } from '../../../shared/components/ui.jsx';
import ClassCards from '../../dojos-classes/components/ClassCards.jsx';
export default function HomePage() {
  const { catalogue } = useApp();
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">A PRACTICE FOR LIFE</span>
          <h1>
            Find your balance.
            <br />
            Begin your <em>Aikido journey.</em>
          </h1>
          <p>
            More than movement. A place to build confidence, discover connection and grow
            with every practice.
          </p>
          <div className="row">
            <Link className="button red" to="/classes">
              Explore classes <ArrowUpRight size={18} />
            </Link>
            <Link className="button outline" to="/how-to-join">
              How to join
            </Link>
          </div>
          <div className="hero-bottom">
            <span>01 / DISCOVER YOUR PRACTICE</span>
            <span>AIKIDO</span>
          </div>
        </div>
        <figure className="hero-photo">
          <img
            src="/assets/photos/aikido-training.jpg"
            alt="Illustrative Aikido training in Japan, by Ignat Gorazd; not ASK members"
          />
          <figcaption>
            AIKIDO IN PRACTICE · Illustrative training in Japan, not ASK members
          </figcaption>
        </figure>
      </section>
      <div className="benefits">
        <div>
          <ShieldCheck />
          <strong>Practice with purpose</strong>
          <span>Balance, awareness and respect</span>
        </div>
        <div>
          <MapPin />
          <strong>One connected journey</strong>
          <span>Your training across centres</span>
        </div>
        <div>
          <Activity />
          <strong>See your progress</strong>
          <span>Every verified session matters</span>
        </div>
      </div>
      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">FIND YOUR PLACE ON THE MAT</span>
            <h2>A class for your journey.</h2>
          </div>
          <Link className="text-link" to="/classes">
            View all classes ↗
          </Link>
        </div>
        <Resource resource={catalogue}>
          {(data) => <ClassCards classes={data.classTypes.slice(0, 3)} />}
        </Resource>
      </section>
      <section className="join-band">
        <span className="eyebrow">SMALL STEPS. LASTING GROWTH.</span>
        <h2>Your next chapter begins with one class.</h2>
        <p>
          Discover a class, apply for membership, and follow your progress in one place.
        </p>
        <Link className="button red" to="/how-to-join">
          Start your journey →
        </Link>
      </section>
    </>
  );
}
