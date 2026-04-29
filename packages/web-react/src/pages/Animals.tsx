import { useQuery } from '@tanstack/react-query';
import { getAnimals, type AnimalDTO } from '@/api/animals';

export function Animals() {
  const {
    data: animals,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['animals'],
    queryFn: async () => {
      const { data } = await getAnimals();
      return data ?? [];
    },
  });

  if (isLoading) return <p>Loading…</p>;
  if (error) return <p className="text-red-600">Failed to load animals.</p>;

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
          {animals?.map((animal: AnimalDTO) => (
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
