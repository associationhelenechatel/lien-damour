export default function FamilyMemberLoading() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem-1px)] items-center justify-center bg-white">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-600" />
        <p className="text-slate-600">Chargement de la fiche…</p>
      </div>
    </div>
  );
}
