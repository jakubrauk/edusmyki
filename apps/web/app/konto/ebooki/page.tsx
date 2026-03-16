export const metadata = { title: "Moje ebooki" };

// TODO: fetch download tokens for logged-in user from Strapi
export default function MojeEbooki() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Moje ebooki</h1>
      <p className="text-gray-500">
        Po zalogowaniu zobaczysz tutaj zakupione ebooki z linkami do pobrania.
      </p>
    </div>
  );
}
