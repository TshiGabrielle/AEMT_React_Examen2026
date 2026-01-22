const url = 'http://localhost:8080/api/folders';

export class FoldersExportService {
  async downloadZip(folderId: number) {
    const res = await fetch(`${url}/${folderId}/export/zip`);

    if (!res.ok) {
      throw new Error("Erreur lors de l'export du dossier");
    }

    return await res.blob(); // on récupère le zip en binaire
  }
}