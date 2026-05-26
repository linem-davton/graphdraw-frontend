
export const getApplicationParameterError = (
  N,
  maxWCET,
  minWCET,
  minMCET,
  minDeadlineOffset,
  maxDeadline,
  linkProb,
  maxMessageSize,
) => {
  if (N < 1) {
    return "Tasks must be at least 1.";
  }

  if (maxWCET < 1) {
    return "Max WCET must be at least 1.";
  }

  if (minWCET < 1) {
    return "Min WCET must be at least 1.";
  }

  if (minMCET < 1) {
    return "Min MCET must be at least 1.";
  }

  if (maxWCET < minWCET) {
    return "Max WCET must be greater than or equal to Min WCET.";
  }

  if (minMCET > minWCET) {
    return "Min MCET must be less than or equal to Min WCET.";
  }

  if (maxDeadline < minDeadlineOffset + maxWCET) {
    return "Max Deadline must be at least Deadline-WCET Offset plus Max WCET.";
  }

  if (minDeadlineOffset < 0) {
    return "Deadline-WCET Offset must be 0 or greater.";
  }

  if (linkProb < 0 || linkProb > 1) {
    return "Link Probability must be between 0 and 1.";
  }

  if (maxMessageSize < 1) {
    return "Max Message Size must be at least 1.";
  }

  return "";
};

export const generateRandomAM = (N, maxWCET, minWCET, minMCET, minDeadlineOffset, maxDeadline, linkProb, maxMessageSize) => {

  // generates random application model where the link probability drops as the distance between nodes increases
  const tasks = [];
  const messages = [];

  const error = getApplicationParameterError(
    N,
    maxWCET,
    minWCET,
    minMCET,
    minDeadlineOffset,
    maxDeadline,
    linkProb,
    maxMessageSize,
  );

  if (error) {
    console.error(error);
    return { tasks, messages };
  }
  // Create N nodes
  for (let i = 0; i < N; i++) {
    const wcet = Math.floor(Math.random() * maxWCET) + minWCET;
    const mcet = Math.floor(Math.random() * (wcet)) + minMCET;
    const deadline = Math.floor(Math.random() * maxDeadline) + minDeadlineOffset + wcet;
    tasks.push({ id: i, wcet: wcet, mcet: mcet, deadline: deadline });
  }

  // Create random edges ensuring no cycles
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      if (Math.random() < linkProb / (1 * (j - i))) {
        const size = Math.floor(Math.random() * maxMessageSize) + 1;
        messages.push({ id: j - i, sender: i, receiver: j, size: size });
      }
    }
  }

  return { tasks, messages };
};

export const getPlatformParameterError = (
  compute,
  routers,
  sensors,
  actuators,
  maxLinkDelay,
  minLinkDelay,
  maxBandwidth,
  minBandwidth,
) => {
  if (compute < 1) {
    return "Compute Nodes must be at least 1.";
  }

  if (routers < 1) {
    return "Routers must be at least 1.";
  }

  if (sensors < 1) {
    return "Sensors must be at least 1.";
  }

  if (actuators < 1) {
    return "Actuators must be at least 1.";
  }

  if (maxLinkDelay < 1) {
    return "Max Link Delay must be at least 1.";
  }

  if (minLinkDelay < 1) {
    return "Min Link Delay must be at least 1.";
  }

  if (maxLinkDelay < minLinkDelay) {
    return "Max Link Delay must be greater than or equal to Min Link Delay.";
  }

  if (maxBandwidth < 1) {
    return "Max Bandwidth must be at least 1.";
  }

  if (minBandwidth < 1) {
    return "Min Bandwidth must be at least 1.";
  }

  if (maxBandwidth < minBandwidth) {
    return "Max Bandwidth must be greater than or equal to Min Bandwidth.";
  }

  return "";
};

export const generateRandomPM = (compute, routers, sensors, actuators, maxLinkDelay, minLinkDelay, maxBandwidth, minBandwidth) => {

  // Generates PM with each non router node connected to exactly one router and each router connected to the next router with the last router connected to the first router

  const nodes = [];
  const links = [];

  const error = getPlatformParameterError(
    compute,
    routers,
    sensors,
    actuators,
    maxLinkDelay,
    minLinkDelay,
    maxBandwidth,
    minBandwidth,
  );

  if (error) {
    console.error(error);
    return { nodes, links };
  }


  const totalNodes = compute + routers + sensors + actuators;
  for (let i = 0; i < totalNodes; i++) {
    if (i < compute) {
      nodes.push({ id: i, type: 'compute' });
    }
    else if (i < compute + routers) {
      nodes.push({ id: i, type: 'router' });
    }
    else if (i < compute + routers + sensors) {
      nodes.push({ id: i, type: 'sensor' });
    }
    else {
      nodes.push({ id: i, type: 'actuator' });
    }
  }

  var end_node;
  for (let i = 0; i < totalNodes; i++) {
    const link_delay = Math.floor(Math.random() * maxLinkDelay) + minLinkDelay;
    const bandwidth = Math.floor(Math.random() * maxBandwidth) + minBandwidth;
    if (nodes[i].type !== 'router') {
      end_node = Math.floor(Math.random() * (routers - 1)) + compute;
    }
    else {
      end_node = i < compute + routers - 1 ? i + 1 : compute;
    }

    links.push({ id: i, start_node: i, end_node: end_node, link_delay: link_delay, bandwidth: bandwidth, type: 'ethernet' });
  }

  return { nodes, links };
};
