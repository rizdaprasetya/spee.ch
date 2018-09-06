import { connect } from 'react-redux';
import { clearFile, startPublish } from '../../actions/publish';
import View from './view';

const mapStateToProps = ({ channel, publish, site }) => {
  return {
    file                 : publish.file,
    disableAnonPublishing: site.disableAnonPublishing,
    publishInChannel     : publish.publishInChannel,
  };
};

const mapDispatchToProps = {
  clearFile,
  startPublish,
};

export default connect(mapStateToProps, mapDispatchToProps)(View);
