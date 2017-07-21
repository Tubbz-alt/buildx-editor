
const r = window['require'];
const noflo = r('noflo');
const nofloWebRTC = r('noflo-runtime-webrtc');


export function flowhubURL(signalServer, runtimeId, options) {
  options = options || {};
  options.ide = options.ide || 'http://app.flowhub.io';
  const protocol = 'webrtc';
  const address = `${signalServer}#${runtimeId}`;
  const params = `protocol=${protocol}&address=${address}&id=${runtimeId}`;
  var debugUrl = options.ide+'#runtime/endpoint?'+encodeURIComponent(params);
  return debugUrl;
}

function createRuntime(libraryPrefix, options) {

  options = options || {};
  options.protocol = options.protocol || 'webrtc';
  options.signalServer = options.signalServer || 'https://api.flowhub.io';

  if (options.id) {
    options.address = options.signalServer + "#" + options.id;
  }

  var runtimeOptions = {
    baseDir: libraryPrefix,
    defaultPermissions: [
      'protocol:graph',
      'protocol:component',
      'protocol:network',
      'protocol:runtime',
      'component:getsource',
      'component:setsource'
    ]
  };

  if (options.graph) {
    runtimeOptions.defaultGraph = options.graph;
  }

  var runtime = null;
  if (options.protocol == 'webrtc') {
    if (options.address) {
      // ID to use specified from outside, normally by Flowhub IDE
      runtime = nofloWebRTC(options.address, runtimeOptions, true);
    } else {
      // Generate new ID
      runtime = nofloWebRTC(null, runtimeOptions, true);
      runtime.signaller = options.signalServer;
    }
  } else if (queryProtocol == 'iframe') {
    runtime = iframeRuntime(runtimeOptions);
  }
  return runtime;
}

export function setupAndRun(options, callback) {
  options = options || {};
  const libraryPrefix = 'buildx-sprint';
  const mainGraph = 'main';

  const loader = new noflo.ComponentLoader(libraryPrefix);

  loader.load(mainGraph, function (err, instance) {
    if (err) { return callback(err); }

    instance.on('ready', function () {
      const graph = instance.network.graph;
      const runtime = createRuntime(libraryPrefix, { graph: graph, id: options.id });
      runtime.start();
      setTimeout(() => {
        return callback(null, runtime);
      }, 100);
    });
  });
}

