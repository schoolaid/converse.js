/* global mock, converse */
const { Strophe, sizzle, stx, u, errors } = converse.env;

describe('The pubsub API', function () {

    describe('fetching a nodes config settings', function () {
        it(
            "can be used to fetch a nodes's configuration settings",
            mock.initConverse([], {}, async function (_converse) {
                await mock.waitForRoster(_converse, 'current', 0);
                const { api } = _converse;
                const sent_stanzas = api.connection.get().sent_stanzas;
                const own_jid = _converse.session.get('jid');

                const node = 'princely_musings';
                const pubsub_jid = 'pubsub.shakespeare.lit';
                const promise = api.pubsub.config.get(pubsub_jid, node);
                const sent_stanza = await u.waitUntil(() =>
                    sent_stanzas.filter((iq) => sizzle('pubsub configure', iq)).pop()
                );

                const response = stx`
                    <iq type='result'
                        xmlns="jabber:client"
                        from='${pubsub_jid}'
                        to='${own_jid}'
                        id="${sent_stanza.getAttribute('id')}">
                    <pubsub xmlns='http://jabber.org/protocol/pubsub#owner'>
                        <configure node='${node}'>
                        <x xmlns='jabber:x:data' type='form'>
                            <field var='FORM_TYPE' type='hidden'>
                            <value>http://jabber.org/protocol/pubsub#node_config</value>
                            </field>
                            <field var='pubsub#title' type='text-single'
                                label='A friendly name for the node'/>
                            <field var='pubsub#deliver_notifications' type='boolean'
                                label='Whether to deliver event notifications'>
                            <value>true</value>
                            </field>
                            <field var='pubsub#deliver_payloads' type='boolean'
                                label='Whether to deliver payloads with event notifications'>
                            <value>true</value>
                            </field>
                            <field var='pubsub#notify_config' type='boolean'
                                label='Notify subscribers when the node configuration changes'>
                            <value>0</value>
                            </field>
                            <field var='pubsub#notify_delete' type='boolean'
                                label='Notify subscribers when the node is deleted'>
                            <value>false</value>
                            </field>
                            <field var='pubsub#notify_retract' type='boolean'
                                label='Notify subscribers when items are removed from the node'>
                            <value>false</value>
                            </field>
                            <field var='pubsub#notify_sub' type='boolean'
                                label='Notify owners about new subscribers and unsubscribes'>
                            <value>0</value>
                            </field>
                            <field var='pubsub#persist_items' type='boolean'
                                label='Persist items to storage'>
                            <value>1</value>
                            </field>
                            <field var='pubsub#max_items' type='text-single'
                                label='Max # of items to persist. \`max\` for no specific limit other than a server imposed maximum.'>
                            <value>10</value>
                            </field>
                            <field var='pubsub#item_expire' type='text-single'
                                label='Time after which to automatically purge items. \`max\` for no specific limit other than a server imposed maximum.'>
                            <value>604800</value>
                            </field>
                            <field var='pubsub#subscribe' type='boolean'
                                label='Whether to allow subscriptions'>
                            <value>1</value>
                            </field>
                            <field var='pubsub#access_model' type='list-single'
                                label='Specify the subscriber model'>
                            <option><value>authorize</value></option>
                            <option><value>open</value></option>
                            <option><value>presence</value></option>
                            <option><value>roster</value></option>
                            <option><value>whitelist</value></option>
                            <value>open</value>
                            </field>
                            <field var='pubsub#roster_groups_allowed' type='list-multi'
                                label='Roster groups allowed to subscribe'>
                            <option><value>friends</value></option>
                            <option><value>courtiers</value></option>
                            <option><value>servants</value></option>
                            <option><value>enemies</value></option>
                            </field>
                            <field var='pubsub#publish_model' type='list-single'
                                label='Specify the publisher model'>
                            <option><value>publishers</value></option>
                            <option><value>subscribers</value></option>
                            <option><value>open</value></option>
                            <value>publishers</value>
                            </field>
                            <field var='pubsub#purge_offline' type='boolean'
                                label='Purge all items when the relevant publisher goes offline?'>
                            <value>0</value>
                            </field>
                            <field var='pubsub#max_payload_size' type='text-single'
                                label='Max Payload size in bytes'>
                            <value>1028</value>
                            </field>
                            <field var='pubsub#send_last_published_item' type='list-single'
                                label='When to send the last published item'>
                            <option label='Never'><value>never</value></option>
                            <option label='When a new subscription is processed'><value>on_sub</value></option>
                            <option label='When a new subscription is processed and whenever a subscriber comes online'>
                                <value>on_sub_and_presence</value>
                            </option>
                            <value>never</value>
                            </field>
                            <field var='pubsub#presence_based_delivery' type='boolean'
                                label='Deliver event notifications only to available users'>
                            <value>0</value>
                            </field>
                            <field var='pubsub#notification_type' type='list-single'
                                label='Specify the delivery style for event notifications'>
                            <option><value>normal</value></option>
                            <option><value>headline</value></option>
                            <value>headline</value>
                            </field>
                            <field var='pubsub#type' type='text-single'
                                label='Specify the semantic type of payload data to be provided at this node.'>
                            <value>urn:example:e2ee:bundle</value>
                            </field>
                            <field var='pubsub#dataform_xslt' type='text-single' label='Payload XSLT'/>
                        </x>
                        </configure>
                    </pubsub>
                </iq>`;

                _converse.api.connection.get()._dataRecv(mock.createRequest(response));

                const result = await promise;
                expect(result).toEqual({
                    access_model: null,
                    dataform_xslt: null,
                    deliver_notifications: true,
                    deliver_payloads: true,
                    item_expire: '604800',
                    max_items: '10',
                    max_payload_size: '1028',
                    notification_type: null,
                    notify_config: false,
                    notify_delete: false,
                    notify_retract: false,
                    notify_sub: false,
                    persist_items: true,
                    presence_based_delivery: false,
                    publish_model: null,
                    purge_offline: false,
                    roster_groups_allowed: null,
                    send_last_published_item: null,
                    subscribe: true,
                    title: null,
                    type: 'urn:example:e2ee:bundle',
                });
            })
        );

        it(
            "handles error cases",
            mock.initConverse([], {}, async function (_converse) {

                await mock.waitForRoster(_converse, 'current', 0);
                const { api } = _converse;
                const sent_stanzas = api.connection.get().sent_stanzas;
                const own_jid = _converse.session.get('jid');

                const node = 'princely_musings';
                const pubsub_jid = 'pubsub.shakespeare.lit';

                let promise = api.pubsub.config.get(pubsub_jid, node);
                let sent_stanza = await u.waitUntil(() =>
                    sent_stanzas.filter((iq) => sizzle('pubsub configure', iq)).pop()
                );
                let response = stx`<iq type='error'
                        xmlns="jabber:client"
                        from='${pubsub_jid}'
                        to='${own_jid}'
                        id="${sent_stanza.getAttribute('id')}">
                    <error type='cancel'>
                        <feature-not-implemented xmlns='urn:ietf:params:xml:ns:xmpp-stanzas'/>
                        <unsupported xmlns='http://jabber.org/protocol/pubsub#errors' feature='config-node'/>
                    </error>
                </iq>`

                let first_error_thrown = false;
                promise.catch((e) => {
                    expect(e instanceof errors.NotImplementedError).toBe(true);
                    first_error_thrown = true;
                }).finally(() => {
                    expect(first_error_thrown).toBe(true);
                });
                _converse.api.connection.get()._dataRecv(mock.createRequest(response));

                promise = api.pubsub.config.get(pubsub_jid, node);
                sent_stanza = await u.waitUntil(() =>
                    sent_stanzas.filter((iq) => sizzle('pubsub configure', iq)).pop()
                );
                response = stx`<iq type='error'
                        xmlns="jabber:client"
                        from='${pubsub_jid}'
                        to='${own_jid}'
                        id="${sent_stanza.getAttribute('id')}">
                    <error type='auth'><forbidden xmlns='urn:ietf:params:xml:ns:xmpp-stanzas'/></error>
                </iq>`;

                let second_error_thrown = false;
                promise.catch((e) => {
                    expect(e instanceof errors.ForbiddenError).toBe(true);
                    second_error_thrown = true;
                }).finally(() => {
                    expect(second_error_thrown).toBe(true);
                });
                _converse.api.connection.get()._dataRecv(mock.createRequest(response));

                promise = api.pubsub.config.get(pubsub_jid, node);
                sent_stanza = await u.waitUntil(() =>
                    sent_stanzas.filter((iq) => sizzle('pubsub configure', iq)).pop()
                );
                response = stx`<iq type='error'
                        xmlns="jabber:client"
                        from='${pubsub_jid}'
                        to='${own_jid}'
                        id="${sent_stanza.getAttribute('id')}">
                    <error type='cancel'><item-not-found xmlns='urn:ietf:params:xml:ns:xmpp-stanzas'/></error>
                </iq>`;

                let third_error_thrown = false;
                promise.catch((e) => {
                    expect(e instanceof errors.ItemNotFoundError).toBe(true);
                    third_error_thrown = true;
                }).finally(() => {
                    expect(third_error_thrown).toBe(true);
                });
                _converse.api.connection.get()._dataRecv(mock.createRequest(response));
        }));
    });
});
