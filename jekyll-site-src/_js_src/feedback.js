const PRODUCT_ID = '';
const BUCKET_NAME = '';


export function initFeedback() {
  const feedbackElement = document.querySelector('.feedback-button');
  if (!feedbackElement) {
    return;
  }

  feedbackElement.addEventListener('click', startFeedback);
}


function startFeedback() {
  if (!window.userfeedback) {
    return;
  }

  window.userfeedback.api.startFeedback({
    productId: PRODUCT_ID,
    bucket: BUCKET_NAME,
    enableAnonymousFeedback: true,
    allowNonLoggedInFeedback: true,
  });
}
