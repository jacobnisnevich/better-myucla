$('#right-sidebar').append('<div id="raw-score-container" class="widget_container"></div>');

var excludableSections = [
	'MyUCLA Gradebook Final Grade',
	'Official Final Grade'
];

var RawScoreContainer = React.createClass({
	render: function() {
		return (
			<div class="widget_title page_collapsible page_collapsible_show collapse-open">
				<span>Raw Score Calculator</span>
			</div>
			<div style="display: block;">
				<div class="widget_content"></div>
			</div>
		);
	}
});

ReactDOM.render(
	<RawScoreContainer />,
	$(#raw-score-container)
);