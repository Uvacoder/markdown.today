import React from "react";
import { connect } from "react-redux";
import Dialog from "material-ui/Dialog";
import TextField from "material-ui/TextField";
import FlatButton from "material-ui/FlatButton";
import { decrypt } from "sjcl";

import {
  attemptToDecryptJournal,
  setEncryptionPassword,
  logout
} from "../actionCreators";
import { needsEncryptionPassword, getEncryptedBlob } from "../accessors";

class PasswordPrompt extends React.Component {
  constructor(props) {
    super(props);
    this.state = { password: "" };
    this.updatePassword = this.updatePassword.bind(this);
  }

  updatePassword(e) {
    const password = e.target.value;
    this.setState({ password });
    try {
      decrypt(password, this.props.encryptedBlob);
    } catch (e) {
      return;
    }
    this.props.setEncryptionPassword(password);
    this.props.attemptToDecryptJournal();
  }

  render() {
    // TODO: Consider a max width.
    // TODO: Focus input
    return (
      <Dialog
        contentStyle={{ maxWidth: "300px" }}
        title="Unlock Journal"
        open={this.props.open}
        actions={[
          (
            <FlatButton
              label="Cancel"
              secondary={true}
              onTouchTap={this.props.logout}
            />
          ),
          <FlatButton disabled={true} label="Decrypt" primary={true} />
        ]}
      >
        <TextField
          hintText="Encryption Password"
          floatingLabelText="Password"
          type="password"
          onChange={this.updatePassword}
          value={this.state.password}
          autoFocus
        />
      </Dialog>
    );
  }
}

const mapStateToProps = state => ({
  open: needsEncryptionPassword(state),
  encryptedBlob: getEncryptedBlob(state)
});

const mapDispatchToProps = {
  attemptToDecryptJournal,
  setEncryptionPassword,
  logout
};

export default connect(mapStateToProps, mapDispatchToProps)(PasswordPrompt);
