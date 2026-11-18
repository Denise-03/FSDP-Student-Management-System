import { useResource } from '../../../shared/hooks/useResource.js';
import { Heading, Resource, ReadinessCard, Card } from '../../../shared/components/ui.jsx';
export default function GradingReadinessPage() {
<<<<<<< HEAD
  const resource = useResource('/readiness');
=======
  const resource = useResource('/readiness', 5000);
>>>>>>> c5b28f4fc52d4b9e5a47b1708d0253400fbe7e94
  return (
    <>
      <Heading title="See how far you’ve come.">
        Your next milestone, explained through verified training.
      </Heading>
      <Resource resource={resource}>
        {(state) => (
          <div className="grid two">
            <ReadinessCard state={state} />
            <Card title="Every qualifying session counts">
              <p>
                Training at {state.centres.join(', ') || 'your centres'} contributes to your
                progress.
              </p>
              <p>
                Only verified present attendance after your rank start counts. Verified
                external events count once. Absent or unverified records contribute zero.
              </p>
              <p>
                Rules are demonstration values, configurable by the administrator. Readiness
                does not confer promotion.
              </p>
            </Card>
          </div>
        )}
      </Resource>
    </>
  );
}
