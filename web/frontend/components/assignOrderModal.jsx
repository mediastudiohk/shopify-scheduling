import { Modal, TextContainer } from "@shopify/polaris";

export const AssignOrderModal = ({
  open = false,
  onClose,
  onConfirm,
  assignOrder = "",
  timeSlot = "",
  area = "",
  district = "",
  isLoadingAssignOrder = false,
}) => (
  <Modal
    open={open}
    onClose={onClose}
    title="Assign Order"
    primaryAction={{
      content: "Confirm",
      onAction: onConfirm,
      loading: isLoadingAssignOrder
    }}
    secondaryActions={[
      {
        content: "Cancel",
        onAction: onClose,
      },
    ]}
  >
    <Modal.Section>
      <TextContainer>
        <p>
          Do you want to assign order <b>{assignOrder}</b> to time slot{" "}
          <b>
            {timeSlot}, {area}
            {district ? `, ${district}` : ""}
          </b>
          ?
        </p>
      </TextContainer>
    </Modal.Section>
  </Modal>
);
