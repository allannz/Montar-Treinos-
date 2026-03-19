const form = document.getElementById("form-treino");
const treinosContainer = document.getElementById("treinos");
const btnPDF = document.getElementById("btnPDF");

const treinos = { A: [], B: [], C: [], D: [], E: [], F: [], G: [] };

// =============================
// TABELA NA TELA
// =============================
function atualizarTabela(treino) {
  let tabelaDiv = document.querySelector(`#div-${treino}`);

  if (!tabelaDiv) {
    tabelaDiv = document.createElement("div");
    tabelaDiv.id = `div-${treino}`;
    tabelaDiv.classList.add("card");

    tabelaDiv.innerHTML = `
      <h2>Treino ${treino}</h2>
      <table>
        <thead>
          <tr>
            <th>Exercício</th>
            <th>Séries</th>
            <th>Repetições</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    `;

    treinosContainer.appendChild(tabelaDiv);
  }

  const tbody = tabelaDiv.querySelector("tbody");
  tbody.innerHTML = "";

  treinos[treino].forEach((ex, idx) => {
    const linha = document.createElement("tr");

    linha.innerHTML = `
      <td>${ex.exercicio}</td>
      <td>${ex.series}</td>
      <td>${ex.repeticoes}</td>
      <td><button class="btn">Remover</button></td>
    `;

    linha.querySelector("button").onclick = () => {
      treinos[treino].splice(idx, 1);
      atualizarTabela(treino);
    };

    tbody.appendChild(linha);
  });
}

// =============================
// ADICIONAR EXERCÍCIO
// =============================
form.addEventListener("submit", e => {
  e.preventDefault();

  const treino = document.getElementById("nomeTreino").value;
  const exercicio = document.getElementById("exercicio").value;
  const series = document.getElementById("series").value;
  const repeticoes = document.getElementById("repeticoes").value;

  treinos[treino].push({ exercicio, series, repeticoes });
  atualizarTabela(treino);

  // reset leve
  document.getElementById("exercicio").value = "";
  document.getElementById("series").value = "3";
  document.getElementById("repeticoes").value = "12";
});

// =============================
// GERAR PDF (VERSÃO CORRETA)
// =============================
btnPDF.addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');

  const nome = localStorage.getItem("nomePersonal") || "Não informado";
  const data = new Date().toLocaleDateString("pt-BR");

  // TÍTULO
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Plano de Treino Personalizado", doc.internal.pageSize.getWidth() / 2, 15, { align: "center" });

  // CABEÇALHO
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Instrutor: ${nome}`, 14, 22);
  doc.text(`Data: ${data}`, 14, 28);

  let posY = 40;
  const margem = 14;

  Object.keys(treinos).forEach(treino => {
    if (treinos[treino].length > 0) {

      // Nome do treino
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Treino ${treino}`, margem, posY);
      posY += 5;

      // Dados da tabela
      const dados = treinos[treino].map(ex => [
        ex.exercicio,
        ex.series,
        ex.repeticoes
      ]);

      // Tabela
      doc.autoTable({
        head: [['Exercício', 'Séries', 'Repetições']],
        body: dados,
        startY: posY,
        theme: 'grid',

        headStyles: {
          fillColor: [0, 123, 255],
          halign: 'center'
        },

        styles: {
          halign: 'center',
          valign: 'middle',
          fontSize: 11
        },

        columnStyles: {
          0: { cellWidth: 110, halign: 'left' },
          1: { cellWidth: 30 },
          2: { cellWidth: 30 }
        }
      });

      posY = doc.lastAutoTable.finalY + 10;
    }
  });

  doc.save("Plano_de_Treino.pdf");
});