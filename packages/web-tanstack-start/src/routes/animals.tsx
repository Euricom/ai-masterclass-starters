import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getAnimals, type AnimalDTO } from '#/api/animals';

const animalsQueryOptions = {
  queryKey: ['animals'],
  queryFn: async () => {
    const { data } = await getAnimals();
    return data ?? [];
  },
};

export const Route = createFileRoute('/animals')({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(animalsQueryOptions);
  },
  component: Animals,
});

function Animals() {
  const { data: animals } = useSuspenseQuery(animalsQueryOptions);

  return (
    <main>
      <h1 className="text-2xl font-bold">Animals</h1>
      <table className="mt-4 w-full text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="pb-2 font-semibold">Name</th>
            <th className="pb-2 font-semibold">Species</th>
            <th className="pb-2 font-semibold">Age</th>
          </tr>
        </thead>
        <tbody>
          {animals.map((animal: AnimalDTO) => (
            <tr key={animal.id} className="border-b last:border-0">
              <td className="py-2">{animal.name}</td>
              <td className="py-2">{animal.species}</td>
              <td className="py-2">{animal.age}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
