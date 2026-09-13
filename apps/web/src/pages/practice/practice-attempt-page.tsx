import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { qk } from '@/lib/queries';
import { useSeo } from '@/lib/seo';
import { EmptyState, Skeleton } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExerciseCard } from '@/features/learning/exercise-card';
import type { ExercisePublic } from '@suraksha/shared';

export default function PracticeAttemptPage() {
  const { slug = '' } = useParams();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: qk.practiceExercise(slug),
    queryFn: () => api<{ exercise: ExercisePublic }>(`/learn/exercises/${slug}`),
  });
  const exercise = data?.exercise;

  useSeo(
    exercise ? `${exercise.title} — Practice — Suraksha Labs` : 'Practice — Suraksha Labs',
    exercise?.instructions || 'Apply what you learn with a hands-on practice exercise.',
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
      <Link
        to="/practice"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        Back to practice
      </Link>

      {isLoading ? (
        <div className="mt-6 space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : error || !exercise ? (
        <div className="mt-10">
          <EmptyState
            title="Exercise not found"
            description="This practice exercise may have been unpublished or moved."
            action={
              <Link to="/practice">
                <Button>Back to practice</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          <ExerciseCard
            exercise={exercise}
            onCompleted={() => {
              queryClient.invalidateQueries({ queryKey: qk.practice });
              queryClient.invalidateQueries({ queryKey: qk.practiceExercise(slug) });
            }}
          />
          {exercise.lesson && (
            <p className="text-center text-sm text-text-tertiary">
              From the lesson{' '}
              <Link
                to={`/learn/${exercise.lesson.pathSlug}/${exercise.lesson.slug}`}
                className="inline-flex items-center gap-1 font-medium text-accent hover:text-accent-hover"
              >
                {exercise.lesson.title}
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
