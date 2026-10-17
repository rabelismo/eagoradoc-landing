# E agora, doc? — landing page

Landing page do **E agora, doc?**, uma coleção de Manuais Integrais e Guias Rápidos de ECG, Trauma (xABCDE), Gasometria e Propedêutica para estudantes de Medicina que já estudaram a teoria e precisam levá-la à prática clínica.

Site publicado: <https://eagoradoc.netlify.app/>

> **Sobre este repositório:** esta é uma **reformulação técnica** do site que já estava no ar. O conteúdo, os produtos, os preços, a identidade visual (cores, fontes, logo e capas) e a estrutura das seções foram mantidos. O trabalho se concentrou em acessibilidade, desempenho, comportamento em diferentes telas e refinamento do acabamento visual.

## O que foi feito na reformulação

### Acessibilidade

- Contraste dos textos pequenos em verde ajustado para o mínimo de 4,5:1 (WCAG AA), com uma cor própria para texto (`--teal-text`).
- Carrosséis marcados como `role="region"`, para que o leitor de tela anuncie o rótulo.
- O Esc fecha o menu mobile e devolve o foco ao botão do menu.
- Suporte completo a "reduzir movimento" (`prefers-reduced-motion`), incluindo a rolagem dos carrosséis feita por JavaScript.
- `translate="no"` nos nomes de marca, para a tradução automática do navegador não deformá-los.
- Indicador de carregamento e dimensões fixas na imagem ampliada das amostras, sem salto de layout.

### Tipografia e conteúdo

- Espaço inseparável em todos os preços (`R$&nbsp;29,90`), para o "R$" não ficar sozinho no fim da linha.
- Algarismos de largura fixa (`tabular-nums`) nos preços.
- Correção de espaçamento no botão final de compra.

### Comportamento e interação

- O filtro da galeria fica salvo na URL (`?filtro=ecg`), então dá para compartilhar o link já filtrado.
- Cards de preço do mesmo tamanho, com destaque ao passar o mouse ou ao focar pelo teclado. Os cards dos Manuais Integrais têm o mesmo efeito.
- Efeitos de hover só em dispositivos com mouse (`@media (hover: hover)`), sem efeito "grudado" no celular.
- `overscroll-behavior` nos carrosséis e na imagem ampliada, para a rolagem não vazar para a página nem acionar o "voltar" do navegador.
- O evento de redimensionamento da janela recalcula no máximo uma vez por quadro (`requestAnimationFrame`).

### Visual e movimento

- Escala de tamanhos de fonte reduzida e texto corrido com no mínimo 16px.
- Superfícies separadas por tons da paleta, com menos sombras e contornos.
- Entrada das seções em sequência ao rolar a página, e capas do topo que se distribuem ao carregar. Se o JavaScript falhar, todo o conteúdo continua visível.

## Tecnologias

Site estático, sem etapa de build e sem dependências:

- HTML, CSS e JavaScript puro
- Fontes League Spartan e Montserrat (Google Fonts)
- Hospedagem no [Netlify](https://www.netlify.com/)
- Checkout pela [Kiwify](https://kiwify.com.br/) e atendimento pelo WhatsApp

## Estrutura

```
.
├── index.html
├── robots.txt
├── sitemap.xml
└── assets/
    ├── css/styles.css
    ├── js/config.js     # links de compra (Kiwify) e WhatsApp
    ├── js/main.js       # menu, carrosséis, galeria, lightbox e animações
    └── img/             # logo, capas e amostras das páginas
```

## Como rodar localmente

Com Python:

```bash
python -m http.server 8000
```

Ou com Node:

```bash
npx serve .
```

Depois abra <http://localhost:8000> (ou <http://localhost:3000>, no caso do Node).

Abrir o `index.html` direto pelo explorador de arquivos também funciona, mas algumas coisas, como o filtro da galeria salvo na URL, só se comportam como no site publicado quando a página é servida por HTTP.

## Configuração

Os links de compra e o contato ficam todos em **`assets/js/config.js`**:

- `kiwify`: um link de checkout para cada produto (Coleção Completa, kits e manuais avulsos);
- `whatsapp`: o link do WhatsApp (`link`) ou o número com DDI e DDD (`numero`), além da mensagem inicial.

Se algum link ficar vazio, o botão correspondente aparece com a etiqueta "link pendente" e um aviso no topo da página.

## Publicação

O site é estático, então basta publicar a pasta do projeto no Netlify, arrastando a pasta no painel ou conectando este repositório. Não há comando de build, e o diretório de publicação é a raiz do projeto.

## Direitos

O conteúdo dos manuais, as capas, as amostras e a marca **E agora, doc?** pertencem aos seus autores. Todos os direitos reservados.
