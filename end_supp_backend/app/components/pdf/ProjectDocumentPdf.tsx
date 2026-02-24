import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';



const styles = StyleSheet.create({
    page: { padding: 20 },
    header: { fontSize: 24, marginBottom: 10}
})

export const ProjectDocumentPdf = ({ data }: { data: any }) => (
    <Document>
        <Page size="A4" style={styles.page}>
    <View>
        <Text style={styles.header}>{data.title}</Text>
        <Text>Version: {data.version}</Text>
    </View>
    </Page>
    </Document>
);