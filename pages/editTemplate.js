import React from "react";
import {
  Card,
  Form,
  FormLayout,
  Layout,
  Page,
  Button,
  SettingToggle,
  TextStyle,
  Stack,
  TextField,
} from "@shopify/polaris";
import CreateTemplate from "../components/createTemplate";
import { Redirect } from "@shopify/app-bridge/actions";
import { Provider, Context } from "@shopify/app-bridge-react";
//import sample from "../assets/sample.json";

// const app = useAppBridge();
// const redirect = Redirect.create(app);

async function getTemplateData(templateID) {
  try {
    var res = await fetch(`/templates/${templateID}`);
    var jsonRes = await res.json();
    console.log("templateData- ", jsonRes);
    return jsonRes.template;
  } catch (err) {
    console.log(err);
  }
}

class EditTemplate extends React.Component {
  constructor(props) {
    super(props);
    this.state = { design: null, template: null };
    this.saveDesign = this.saveDesign.bind(this);
  }
  async componentDidMount() {
    const template = await getTemplateData(this.props.templateID);
    console.log(template);
    if (template) {
      this.setState({ template: template, design: template.design });
    }
  }
  async saveDesign(updatedDesign) {
    try {
      const res = await fetch(`/templates/update/${this.state.template._id}`, {
        method: "PATCH",
        body: JSON.stringify({ design: updatedDesign }),
      });
      const jsonRes = await res.json();
      console.log(jsonRes);
      this.setState({
        template: jsonRes.template,
        design: jsonRes.template.design,
      });
    } catch (err) {
      console.log(err.message);
    }
  }
  static contextType = Context;

  render() {
    const { templateID, shop_name } = this.props;
    const app = this.context;
    const redirect = Redirect.create(app);

    const redirectToDashBoard = (shop_name) => {
      redirect.dispatch(Redirect.Action.APP, {
        path: `/?shop=${shop_name}`,
      });
    };
    //console.log(templateID, shop_name);
    return (
      <Page>
        <Layout>
          <Button
            primary
            onClick={() => {
              redirectToDashBoard(shop_name);
            }}
          >
            Back to DashBoard
          </Button>
          <CreateTemplate
            savedDesign={this.state.design}
            saveUpdatedDesign={(design) => {
              this.saveDesign(design);
            }}
          />
        </Layout>
      </Page>
    );
  }
}

export default EditTemplate;
