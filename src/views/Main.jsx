import Test from "assets/data/test.md";
import imgfile from "assets/img/import.jpg";

export const Main = () => {
  return (
    <div className={"container py-5"}>
      <h1 className={"text-center text-muted font-weight-100"}>
        Hello, World!
      </h1>

      <p className={"text-center"}>
        Olá! Esta é uma aplicação Preact inspirada no <code>create-react-app</code> feita apenas com Webpack!
      </p>

      <p className={"text-center"}>
        Você pode usar conteúdo de <code>public</code> normalmente, como se fosse a raíz:<br/>
        <img src={"/img/hello.jpg"} alt={""}/>
      </p>

      <p className={"text-center"}>
        Ou importar via código, para que seja hasheada:<br/>
        <img src={imgfile} alt={""}/>
      </p>

      <p className={"text-center"}>
        Como bônus, adicionei Bootstrap e, também, FontAwesome! <i className={"fa fa-truck"}/>
      </p>

      <p className={"text-center"}>
        Também tem hot reload, resolução de caminhos pra JS/SCSS, imports de arquivos com resolução e outras mágicas.
      </p>

      <p className={"text-center"}>
        Este projeto foi feito com o intuito de ensinar as pessoas a usarem Webpack, e explicar como bundlers e templates de projeto funcionam. Fazendo parte de um projeto no qual monto o MESMO boilerplate para três frameworks diferentes, mas seguindo o mesmo conceito e lógicas.
      </p>

      <hr/>

      <h4>Quer mais? Então aqui:</h4>

      <p>A gente também suporta Markdown com frontmatter!</p>

      <h5>Aqui um markdownzinho:</h5>

      <div className={"shadow p-2 mb-2"}>
        <Test.react/>
      </div>

      <h5>E o frontmatter dele:</h5>

      <div className={"shadow p-2"}>
        <pre>{JSON.stringify(Test.attributes, null, 2)}</pre>
      </div>

      <hr/>

      <p className={"text-muted"}>
        <em>
          &copy;2021 Fabio Y. Goto
        </em>
      </p>
    </div>
  );
};
