function onYouTubeLinkClick(youTubeId)
{
	let popupContainer = document.createElement("div");
	popupContainer.classList.add("videoContainer");
	let videoIFrame = document.createElement("iframe");
	videoIFrame.setAttribute("width", 560);
	videoIFrame.setAttribute("height", 315);
	videoIFrame.setAttribute("src", "https://www.youtube.com/embed/" + youTubeId);
	videoIFrame.setAttribute("frameborder", 0);
	videoIFrame.setAttribute("allowfullscreen", "");
	document.body.appendChild(popupContainer);
	popupContainer.appendChild(videoIFrame);
	let shieldElement = document.createElement("div");
	shieldElement.classList.add("shieldBackground");
	shieldElement.onclick = () =>
	{
		document.body.removeChild(popupContainer);
		document.body.removeChild(shieldElement);
	}
	document.body.appendChild(shieldElement);
}