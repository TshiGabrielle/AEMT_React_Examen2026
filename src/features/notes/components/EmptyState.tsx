
// Composant affiché lorsqu'aucune note n'est sélectionnée
export function EmptyState() {
  return (
    // Zone principale où s'affiche normalement l'éditeur de notes
    <main className="editor">

      {/* Message d'état vide pour guider l'utilisateur */}
      <div className="empty-state">
        <h2>👻 Sélectionnez une note</h2>
        <p>ou créez-en une nouvelle</p>
      </div>

    </main>
  );
}
