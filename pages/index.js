import React, { useRef } from "react";
import {
  Button,
  Page,
  EmptyState,
  Layout,
  Popover,
  FormLayout,
  DataTable,
  TextField,
  Link,
  Card,
} from "@shopify/polaris";
import { ResourcePicker, TitleBar } from "@shopify/app-bridge-react";
import CreateTemplate from "../components/createTemplate";
//import { getAllTemplates } from "../functions/shopFuntions";
import { Redirect } from "@shopify/app-bridge/actions";
import { Provider, Context } from "@shopify/app-bridge-react";

const img =
  "https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png";

//const serverURL = process.env.SERVER_URL;
async function getAllTemplates(shop_name) {
  try {
    const url = `/shop/${shop_name}`;
    console.log(url);
    const res = await fetch(url);
    const jsonRes = await res.json();
    //console.log(jsonRes);
    return jsonRes.templates;
  } catch (err) {
    throw err;
  }
}

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      templates: [],
      popoverActive: false,
      nameValue: null,
    };
    this.togglePopoverActive = this.togglePopoverActive.bind(this);
    this.handleTagValueChange = this.handleTagValueChange.bind(this);
    this.handleNameSubmit = this.handleNameSubmit.bind(this);
  }

  static contextType = Context;

  async componentDidMount() {
    //console.log(this.props.shop_name);
    const templates = await getAllTemplates(this.props.shop_name);
    console.log("fetched templates - ", templates);

    this.setState({ templates });
  }
  togglePopoverActive() {
    const presentState = this.state.popoverActive;
    this.setState({ popoverActive: !presentState, nameValue: null });
  }
  handleTagValueChange(value) {
    this.setState({ nameValue: value });
  }
  handleNameSubmit() {
    const shop_name = this.props.shop_name;
    const value = this.state.nameValue;
    const prevTemplates = this.state.templates;
    console.log(value);
    fetch(`/templates/checkForName/${value}`)
      .then((res) =>
        res.json().then((jsonRes) => {
          console.log(jsonRes);
          if (jsonRes.alreadyPresent) {
            return alert("This name is already taken");
          } else {
            const data = {};
            data.name = value;
            console.log(data);
            console.log(shop_name);
            fetch(`/templates/add/${shop_name}`, {
              method: "POST",
              body: JSON.stringify(data),
            }).then((res) =>
              res.json().then((jsonRes) => {
                console.log(jsonRes);
                if (jsonRes.success) {
                  var template = {};
                  template._id = jsonRes.template._id;
                  template.name = jsonRes.template.name;
                  template.createdAt = jsonRes.template.createdAt;
                  template.updatedAt = jsonRes.template.updatedAt;
                  prevTemplates.push(template);
                  this.setState({ templates: prevTemplates });
                }
              })
            );
          }
        })
      )
      .catch((err) => {
        console.error(err);
      });
  }

  render() {
    const app = this.context;
    const redirect = Redirect.create(app);
    const shop_name = this.props.shop_name;
    function redirectToEditTemplate(templateID) {
      redirect.dispatch(Redirect.Action.APP, {
        path: `/editTemplate?shop=${shop_name}&templateID=${templateID}`,
        //newContext: true,
      });
    }

    const activator = (
      <Button primary onClick={this.togglePopoverActive} disclosure>
        Add Template
      </Button>
    );
    var rows = [];
    function createRowList(templates) {
      if (templates.length != 0) {
        templates.forEach((template) => {
          rows.push([
            <Link
              removeUnderline
              onClick={() => {
                redirectToEditTemplate(template._id);
              }}
              key={template._id}
            >
              {template.name}
            </Link>,
            `${template.createdAt}`,
            `${template.updatedAt}`,
          ]);
        });
      }
    }
    createRowList(this.state.templates);

    return (
      <Page>
        <Layout>
          <div style={{ width: "-webkit-fill-available" }}>
            {this.state.templates.length != 0 ? (
              <Card title="All Templates Listed Below" sectioned={true}>
                <DataTable
                  columnContentTypes={["text", "text", "text"]}
                  headings={["Template Name", "Created At", "Updated At"]}
                  rows={rows}
                />
              </Card>
            ) : (
              <EmptyState heading="Add Template to start" image={img}>
                <p>Edit and Save Email Templates</p>
              </EmptyState>
            )}
            <div style={{ height: "280px" }}>
              <Popover
                active={this.state.popoverActive}
                activator={activator}
                onClose={this.togglePopoverActive}
                ariaHaspopup={false}
                sectioned
              >
                <FormLayout>
                  <TextField
                    label="Name"
                    value={this.state.nameValue}
                    onChange={this.handleTagValueChange}
                  />
                  <Button size="slim" submit onClick={this.handleNameSubmit}>
                    Submit
                  </Button>
                </FormLayout>
              </Popover>
            </div>
          </div>
        </Layout>
      </Page>
    );
  }
}

export default Index;
