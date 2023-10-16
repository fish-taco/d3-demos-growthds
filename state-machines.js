

function state_transitions(svg, history_g_bars, foci, color){

  var state_transition_probabilities = [
    [0, 1, 0, 0, 0],
    [0, 0.60, 0.19, 0.11, 0.1],
    [0, 0.1, 0.66, 0.04, 0.2],
    [0, 0.1, 0.1, 0.70, 0.1],
    [0, 0, 0, 0, 1]
  ]

  var t = 0
  var history_data = []

  var state_machine_animation_interval = d3.interval(function(){

    // *** SIMULATION ***

    // update time
    t += 1

    // stop simulation after 40 timesteps
    if (t > 40) { state_machine_animation_interval.stop(); simulation.stop(); return true }

    // change node states according to transition probabilities matrix
    // (and compute updated foci counts while at it)

    var focus_node_count = []
    foci.forEach(function(d){
      focus_node_count.push(0)
    })
    nodes.forEach(function(o, i) {
      var trans_probs = state_transition_probabilities[o.state]
      var cum_trans_probs = []
      trans_probs.reduce(function(a,b,i) { return cum_trans_probs[i] = a+b },0)
      var r = Math.random()
      var new_state = cum_trans_probs.findIndex(function(d){ return d >= r })
      if (new_state != -1) {
        o.previous_state = o.state
        o.state = new_state
      }
      focus_node_count[o.state] += 1
    })
    if (t > 1){
      history_data.push({
          t: t-1,
          n1: focus_node_count[1],
          n2: focus_node_count[2],
          n3: focus_node_count[3],
          n4: focus_node_count[4]
        })
    }

    // possibly add some new nodes

    var num_new = 100
    if (t > 1) { num_new = Math.floor(Math.random() * 5) }

    for (var i=0; i<num_new; i++) {
      nodes.push({id: nodes.length, state: 0, previous_state: 0})
    }


    // *** UPDATE SVG ANIMATION ***

    // update history chart

    var new_stacked_column = history_g_bars.selectAll(".state_history")
          .data(history_data)
        .enter().append("g")
        .attr("class", "state_history")

    var d = new_stacked_column.data()[0]
    if (d) {
      var base_height = 0
      for (var i=1; i<5; i++) {
        var height = d['n' + i]
        new_stacked_column.append("rect")
            .attr("x", x(d.t))
            .attr("y", y(base_height + height))
            .attr("width", 12)
            .attr("height", y(base_height) - y(height + base_height))
            .style("fill", color(i))
        base_height += height
      }
    }

    // update force graph

    restart()

    foci.forEach(function(d,i){
      d3.select(".state_count_" + i)
        .transition().duration(500)
          .attr("y", d.y - 20 - Math.pow(focus_node_count[i] * 10, 0.5) )
    })

  }, 800, d3.now() - 800)

}
