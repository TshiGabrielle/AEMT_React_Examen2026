const url = 'http://localhost:8080/api/notes';

export class NotesExportService {

    // télécharge une note en PDF
    async downloadPdf(id: number) {
        const response = await fetch(`${url}/${id}/export/pdf`);
        return response.blob(); // le backend renvoie un fichier binaire
    }

    // télécharge une note en ZIP
    async downloadZip(id: number) {
        const response = await fetch(`${url}/${id}/export/zip`);
        return response.blob();
    }
}