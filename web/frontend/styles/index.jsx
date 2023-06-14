export const styles = {
    container: {
        backgroundColor: 'white',
        // marginLeft: '5%',
        // marginRight: '5%',
        // paddingLeft: '1%', 
        // paddingRight: '1%' 
    },
    rowContainer: {
        display: 'flex',
        margin: 4,
        flexDirection: 'row',
        gap: 12
    },
    commentContainer: {
        width: 200,
    },
    commentContainerAlert: {
        border: 1,
        borderColor: 'red',
        width: 200,
    },
    selectContainer: {
        minWidth: 150,
        maxWidth: 150
    },
    selectContainerPlaceOrder: {
        minWidth: 150,
        maxWidth: 150,
        backgroundColor: '#00ff99',
        maxHeight: 36
    },
    orderContainerDetail: {
        textAlign: 'center',
        color: 'orange',
        cursor: 'pointer',
    },
    futureDateContainerDetail: {
        width: 240,
        color: 'orange',
        cursor: 'pointer'
    },
    textPlaceOrder: {
        display: 'flex',
        height: 36,
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center'
    },
    iconDeleteContainer: {
        paddingTop: 8,
        display: 'flex',
        paddingLeft: 4,
        paddingRight: 4,
        marginBottom: 8,
        cursor: 'pointer',
    },
    moveActionContainer: { padding: 2 },
    buttonMoveContainer: {
        flexDirection: 'row',
        display: 'flex',
    },
    mapRowItemContainer: {
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        backgroundColor: 'white',
        overflow: 'auto'
        // height: '100%',
        // width: 1200,
    },
    buttonAddRowContainer: {
        backgroundColor: "#FF8C00",
        width: 120,
        textAlign: 'center',
        color: 'white',
        padding: 8,
        marginTop: 16,
        marginBottom: 16,
        borderRadius: 4,
        fontSize: 14,
        cursor: 'pointer'

    },

    buttonMoveRowContainer: {
        marginRight: 12,
        backgroundColor: "#FF8C00",
        width: 64,
        textAlign: 'center',
        color: 'white',
        padding: 6,
        borderRadius: 4,
        fontSize: 14,
        cursor: 'pointer'
    },
    buttonSaveContainer: {
        marginLeft: 12,
        backgroundColor: "green",
        width: 60,
        textAlign: 'center',
        color: 'white',
        padding: 8,
        marginTop: 16,
        marginBottom: 16,
        borderRadius: 4,
        fontSize: 14,
        cursor: 'pointer'

    },
    textDateStyle: {
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
        fontSize: 24,
        marginTop: 20,
        marginBottom: 20,
    },
    textCategoriesStyle: {
        fontSize: 32,
        marginTop: 20,
        display: 'flex',
    },
    textSelectDayContainer: {
        width: 200,
        color: 'orange',
        cursor: 'pointer'
    },
    loadingContainer: {
        height: 2000
    },
    buttonCalendarContainer: {
        display: 'flex',
        zIndex: 9999,
        width: 120,
        backgroundColor: 'grey',
        height: 32,
        marginTop: 12,
        borderRadius: 4,
    },
    buttonCalendar: {
        padding: 4,
        marginTop: 2,
        backgroundColor: 'white',
        width: 116,
        marginLeft: 2,
        height: 28,
        borderColor: 'grey',
        justifyContent: 'flex-start',
        alignItems: 'center',
        display: 'flex',
        color: 'black',
        fontSize: 14,
        cursor: 'pointer',
        borderRadius: 4,
    },
    iconCalendarContainer: {
        width: '100%',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-end'
    },
    iconCalendar: {
        display: 'flex',
        width: 28,
        height: 28
    },
    loadingContainerIndicator: {
        display: 'flex',
        height: 200, width: 1200,
        justifyItems: 'center',
        justifyContent: 'center',
        paddingTop: 40
    }

}