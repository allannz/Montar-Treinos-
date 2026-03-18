const form = document.getElementById("form-treino");
const treinosContainer = document.getElementById("treinos");
const btnPDF = document.getElementById("btnPDF");

// Armazenar exercícios de cada treino (A a G)
const treinos = { A: [], B: [], C: [], D: [], E: [], F: [], G: [] };

// Criar/atualizar tabela visual
function atualizarTabela(treino) {
  let tabelaDiv = document.querySelector(`#div-${treino}`);

  // Criar div e tabela caso não exista
  if (!tabelaDiv) {
    tabelaDiv = document.createElement("div");
    tabelaDiv.id = `div-${treino}`;

    tabelaDiv.innerHTML = `
      <h2>Treino ${treino} 
        <button class="btn-toggle" style="font-size:12px; margin-left:10px;">Ocultar</button>
      </h2>
      <table id="tabela-${treino}">
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

    // Botão de ocultar/mostrar
    const btnToggle = tabelaDiv.querySelector(".btn-toggle");
    const tabela = tabelaDiv.querySelector("table");

    btnToggle.addEventListener("click", () => {
      if (tabela.style.display === "none") {
        tabela.style.display = "table";
        btnToggle.innerText = "Ocultar";
      } else {
        tabela.style.display = "none";
        btnToggle.innerText = "Mostrar";
      }
    });
  }

  // Atualizar tbody
  const tbody = tabelaDiv.querySelector("tbody");
  tbody.innerHTML = "";

  treinos[treino].forEach((ex, idx) => {
    const linha = document.createElement("tr");
    linha.innerHTML = `
      <td class="td-exercicio" contenteditable="true">${ex.exercicio}</td>
      <td class="td-series" contenteditable="true">${ex.series}</td>
      <td class="td-repeticoes" contenteditable="true">${ex.repeticoes}</td>
      <td><button class="btn btn-remove">Remover</button></td>
    `;
    tbody.appendChild(linha);

    // Atualizar valores ao editar
    linha.querySelector(".td-exercicio").addEventListener("input", e => {
      treinos[treino][idx].exercicio = e.target.innerText;
    });
    linha.querySelector(".td-series").addEventListener("input", e => {
      treinos[treino][idx].series = e.target.innerText;
    });
    linha.querySelector(".td-repeticoes").addEventListener("input", e => {
      treinos[treino][idx].repeticoes = e.target.innerText;
    });

    // Remover exercício
    linha.querySelector(".btn-remove").addEventListener("click", () => {
      treinos[treino].splice(idx, 1);
      atualizarTabela(treino);
    });
  });
}


// Adicionar exercício
form.addEventListener("submit", e => {
  e.preventDefault();
  const treinoSelect = document.getElementById("nomeTreino");
  const treino = treinoSelect.value;
  const exercicio = document.getElementById("exercicio").value;
  const series = document.getElementById("series").value;
  const repeticoes = document.getElementById("repeticoes").value;

  treinos[treino].push({ exercicio, series, repeticoes });
  atualizarTabela(treino);

  document.getElementById("exercicio").value = "";
  document.getElementById("series").value = "3";
  document.getElementById("repeticoes").value = "12";
});


// Gerar PDF
btnPDF.addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');

  // Pegar nome do personal
  const nomePersonal = localStorage.getItem('nomePersonal') || 'Não informado';

  // Pegar data atual
  const dataAtual = new Date().toLocaleDateString('pt-BR');

  // Título
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Plano de Treino Personalizado", doc.internal.pageSize.getWidth() / 2, 15, { align: "center" });

  // Nome e data
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Instrutor: ${nomePersonal}`, 14, 22);
  doc.text(`Data: ${dataAtual}`, 14, 28);

  let posY = 40;
  const margem = 14;
  const larguraExercicio = 110;
  const larguraSeries = 30;
  const larguraRepeticoes = 30;

  Object.keys(treinos).forEach(treino => {
    if (treinos[treino].length > 0) {
      doc.setFontSize(14);
      doc.text(`Treino ${treino}`, margem, posY);
      posY += 5;

      const dados = treinos[treino].map(ex => [ex.exercicio, ex.series, ex.repeticoes]);

      doc.autoTable({
        head: [['Exercício', 'Séries', 'Repetições']],
        body: dados,
        startY: posY,
        theme: 'grid',
        headStyles: { fillColor: [0, 123, 255], halign: 'center' },
        styles: { halign: 'center', valign: 'middle', fontSize: 12 },
        columnStyles: {
          0: { cellWidth: larguraExercicio, halign: 'left' },
          1: { cellWidth: larguraSeries },
          2: { cellWidth: larguraRepeticoes }
        },
        tableWidth: 'auto'
      });

      posY = doc.lastAutoTable.finalY + 15;
    }
  });

  doc.save("Plano_de_Treino.pdf");
});